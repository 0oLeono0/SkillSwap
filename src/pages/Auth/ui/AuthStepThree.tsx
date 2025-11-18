import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './authStepThree.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Title } from '@/shared/ui/Title';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/app/providers/auth';
import { useFiltersBaseData } from '@/features/Filter/model/useFiltersBaseData';
import type { Gender } from '@/entities/User/types';
import SchoolBoardIcon from '@/shared/assets/images/school-board.svg?react';
import stockMain from '@/shared/assets/images/stock/stock.jpg';
import stockSecond from '@/shared/assets/images/stock/stock2.jpg';
import stockThird from '@/shared/assets/images/stock/stock3.jpg';
import stockFourth from '@/shared/assets/images/stock/stock4.jpg';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ApiError, type ApiUserSkill } from '@/shared/api/auth';

const REGISTRATION_STEP_TWO_STORAGE_KEY = 'registration:step2';
const REGISTRATION_CREDENTIALS_STORAGE_KEY = 'registration:credentials';
const STOCK_IMAGES = [stockMain, stockSecond, stockThird, stockFourth];

const generateSkillId = () => {
  const cryptoApi = globalThis?.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `skill-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

interface StepTwoData {
  name: string;
  birthDate: string;
  gender: Gender | '';
  cityId: number | null;
  categoryId: number | null;
  subskillId: number | null;
  avatarUrl: string;
}

interface StepOneCredentials {
  email: string;
  password: string;
}

const AuthStepThree = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { skillGroups } = useFiltersBaseData();

  const stepOneData = useMemo<StepOneCredentials | null>(() => {
    const raw = sessionStorage.getItem(REGISTRATION_CREDENTIALS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StepOneCredentials) : null;
  }, []);

  const stepTwoData = useMemo<StepTwoData | null>(() => {
    const raw = sessionStorage.getItem(REGISTRATION_STEP_TWO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StepTwoData) : null;
  }, []);

  useEffect(() => {
    if (!stepTwoData || !stepOneData) {
      navigate(ROUTES.REGISTER_STEP_TWO);
    }
  }, [stepTwoData, stepOneData, navigate]);

  const [skillTitle, setSkillTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subskillId, setSubskillId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skillOptions = useMemo(() => {
    if (!categoryId) return [];
    return skillGroups.find((group) => group.id === categoryId)?.skills ?? [];
  }, [categoryId, skillGroups]);

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  useEffect(() => () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stepTwoData) {
      navigate(ROUTES.REGISTER_STEP_TWO);
      return;
    }
    setIsPreviewOpen(true);
  };

  const handleEdit = () => {
    setIsPreviewOpen(false);
    setIsSubmitting(false);
    setError(null);
  };

  const findGroupById = (id: number | null | undefined) =>
    typeof id === 'number' ? skillGroups.find((group) => group.id === id) : undefined;

  const findSkillName = (category: number | null | undefined, subskill: number | null | undefined) => {
    const group = findGroupById(category ?? null);
    if (!group) return null;
    return group.skills.find((skill) => skill.id === subskill)?.name ?? null;
  };

  const buildLearningSkillPayload = (): ApiUserSkill | null => {
    if (!stepTwoData || typeof stepTwoData.subskillId !== 'number') {
      return null;
    }

    const groupId = typeof stepTwoData.categoryId === 'number' ? stepTwoData.categoryId : null;
    const title =
      findSkillName(groupId, stepTwoData.subskillId) ?? 'Навык для изучения';

    return {
      id: generateSkillId(),
      title,
      categoryId: groupId,
      subcategoryId: stepTwoData.subskillId,
      description: 'Хочу изучить этот навык',
      imageUrls: STOCK_IMAGES.slice(1),
    };
  };

  const buildTeachableSkillPayload = async (): Promise<ApiUserSkill | null> => {
    if (typeof subskillId !== 'number' || typeof categoryId !== 'number') {
      setError('Выберите категорию и подкатегорию для навыка');
      return null;
    }

    const subskillName = findSkillName(categoryId, subskillId);
    const trimmedTitle = skillTitle.trim() || subskillName || 'Мой навык';
    const trimmedDescription = description.trim();

    const uploadedImages = images.length
      ? await Promise.all(images.map((file) => fileToDataUrl(file)))
      : [];

    const imageUrls = uploadedImages
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    return {
      id: generateSkillId(),
      title: trimmedTitle,
      categoryId,
      subcategoryId: subskillId,
      description:
        trimmedDescription || 'Я поделюсь подробностями об этом навыке позже',
      imageUrls: imageUrls.length ? imageUrls : STOCK_IMAGES,
    };
  };

  const handleConfirm = async () => {
    if (!stepTwoData || !stepOneData) {
      navigate(ROUTES.REGISTER_STEP_TWO);
      return;
    }
    const avatarUrlPayload =
      stepTwoData.avatarUrl && !stepTwoData.avatarUrl.startsWith('blob:')
        ? stepTwoData.avatarUrl
        : undefined;

    try {
      setIsSubmitting(true);
      setError(null);
      const trimmedDescription = description.trim();
      const teachableSkill = await buildTeachableSkillPayload();
      if (!teachableSkill) {
        setIsSubmitting(false);
        return;
      }
      const learningSkill = buildLearningSkillPayload();
      await register({
        email: stepOneData.email,
        password: stepOneData.password,
        name: stepTwoData.name || 'Skill Swapper',
        avatarUrl: avatarUrlPayload,
        cityId: stepTwoData.cityId ?? undefined,
        birthDate: stepTwoData.birthDate || undefined,
        gender: stepTwoData.gender || undefined,
        bio: trimmedDescription || undefined,
        learningSkills: learningSkill ? [learningSkill] : undefined,
        teachableSkills: [teachableSkill],
      });
      sessionStorage.removeItem(REGISTRATION_CREDENTIALS_STORAGE_KEY);
      sessionStorage.removeItem(REGISTRATION_STEP_TWO_STORAGE_KEY);
      setIsPreviewOpen(false);
      navigate(ROUTES.HOME);
    } catch (registerError) {
      if (registerError instanceof ApiError) {
        setError(registerError.message);
      } else {
        setError('Произошла неизвестная ошибка при регистрации. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
const previewCategoryName = categoryId
  ? skillGroups.find((group) => group.id === categoryId)?.name ?? 'Неизвестная категория'
  : 'Категория не выбрана';

  const previewSubcategoryName = subskillId
    ? skillOptions.find((skill) => skill.id === subskillId)?.name ?? ''
    : '';

  const usingFallbackImages = imagePreviews.length === 0;
  const gallery = usingFallbackImages ? STOCK_IMAGES : imagePreviews;

  const mainImage = gallery[0];
  const secondaryImages = gallery.slice(1, 4);
  const remainingCount = usingFallbackImages
    ? 0
    : Math.max(imagePreviews.length - 4, 0);

  return (
    <section className={styles.auth}>
      <div className={styles.card}>
        <div className={styles.stepIndicator}>Шаг 3 из 3</div>
        <div className={styles.layout}>
            <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              title='Название навыка'
              placeholder='Введите название вашего навыка'
              value={skillTitle}
              onChange={(event) => setSkillTitle(event.target.value)}
              required
            />

            <Select
              label='Категория навыка'
              options={skillGroups.map((group) => ({ value: group.id.toString(), label: group.name }))}
              value={categoryId?.toString() ?? ''}
              onChange={(value) => {
              setCategoryId(value ? Number(value) : null);
              setSubskillId(null);
              }}
              placeholder='Выберите категорию навыка'
            />

            <Select
              label='Подкатегория навыка'
              options={skillOptions.map((skill) => ({ value: skill.id.toString(), label: skill.name }))}
              value={subskillId?.toString() ?? ''}
              onChange={(value) => setSubskillId(value ? Number(value) : null)}
              placeholder='Выберите подкатегорию навыка'
              disabled={!categoryId}
            />

            <label className={styles.textareaLabel}>
              Описание
              <textarea
              className={styles.textarea}
              placeholder='Коротко опишите, чему можете научить'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              />
            </label>

            <label className={styles.dropzone}>
              <span className={styles.dropzoneTitle}>Перетащите или выберите изображения навыка</span>
              <span className={styles.dropzoneHint}>Выбрать изображения</span>
              <input type='file' accept='image/*' multiple hidden onChange={handleImagesChange} />
              {images.length > 0 && (
              <span className={styles.dropzoneMeta}>Выбрано файлов: {images.length}</span>
              )}
            </label>

            <div className={styles.actions}>
              <Button type='button' variant='secondary' onClick={() => navigate(-1)}>
              Назад
              </Button>
              <Button type='submit' variant='primary'>
              Продолжить
              </Button>
            </div>
            </form>

          <div className={styles.preview}>
            <SchoolBoardIcon />
            <Title tag='h2' variant='lg'>Предварительный просмотр навыка</Title>
            <p>
              Здесь показан предварительный просмотр вашего навыка. Убедитесь, что название, категория, описание и изображения
              выглядят так, как вы хотите. Чтобы внести изменения — нажмите «Редактировать», чтобы подтвердить и завершить регистрацию — нажмите «Подтвердить».
            </p>
          </div>
        </div>
      </div>

      <Modal isOpen={isPreviewOpen} onClose={handleEdit} className={styles.previewModal}>
        <div className={styles.previewModalHeader}>
          <Title tag='h2' variant='lg'>Предварительный просмотр и подтверждение</Title>
          <p>
            Проверьте информацию о навыке: название, категория, описание и изображения. Если всё верно — нажмите «Подтвердить» для завершения регистрации; чтобы внести изменения — нажмите «Редактировать».
          </p>
        </div>
        <div className={styles.previewModalBody}>
          <div className={styles.previewContent}>
            <Title tag='h2' variant='lg'>{skillTitle || 'Название навыка'}</Title>
            <span className={styles.previewCategory}>
              {previewCategoryName}
              {previewSubcategoryName ? ` / ${previewSubcategoryName}` : ''}
            </span>
            <p className={styles.previewDescription}>
              {description || 'Описание навыка, включая его особенности и преимущества, должно быть четким и информативным. Используйте простые и понятные формулировки, избегайте сложных терминов и жаргона.'}
            </p>
            <div className={styles.previewActions}>
              <Button type='button' variant='secondary' onClick={handleEdit}>
                Редактировать
              </Button>
              {error && <p className={styles.errorMessage}>{error}</p>}
              <Button type='button' variant='primary' onClick={handleConfirm} disabled={isSubmitting}>
                Подтвердить
              </Button>
            </div>
          </div>
          <div className={styles.previewGallery}>
            <img src={mainImage} alt={skillTitle || 'Название навыка'} className={styles.previewMainImage} />
            <div className={styles.previewThumbs}>
              {secondaryImages.map((image) => (
                <img key={image} src={image} alt='Название навыка' className={styles.previewThumb} />
              ))}
              {!usingFallbackImages && remainingCount > 0 && (
                <div className={styles.previewThumbMore}>+{remainingCount}</div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default AuthStepThree;
