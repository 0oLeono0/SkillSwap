import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './authStepThree.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Title } from '@/shared/ui/Title';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/app/providers/auth';
import { getSkillsGroups } from '@/features/Filter/utils';
import type { Gender } from '@/entities/User/types';
import SchoolBoardIcon from '@/shared/assets/images/school-board.svg?react';
import stockMain from '@/shared/assets/images/stock/stock.jpg';
import stockSecond from '@/shared/assets/images/stock/stock2.jpg';
import stockThird from '@/shared/assets/images/stock/stock3.jpg';
import stockFourth from '@/shared/assets/images/stock/stock4.jpg';
import { Modal } from '@/shared/ui/Modal/Modal';

const REGISTRATION_STEP_TWO_STORAGE_KEY = 'registration:step2';

interface StepTwoData {
  name: string;
  birthDate: string;
  gender: Gender | '';
  cityId: number | null;
  categoryId: number | null;
  subskillId: number | null;
  avatarUrl: string;
}

const AuthStepThree = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const skillGroups = useMemo(() => getSkillsGroups(), []);

  const stepTwoData = useMemo<StepTwoData | null>(() => {
    const raw = sessionStorage.getItem(REGISTRATION_STEP_TWO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StepTwoData) : null;
  }, []);

  useEffect(() => {
    if (!stepTwoData) {
      navigate(ROUTES.REGISTER_STEP_TWO);
    }
  }, [stepTwoData, navigate]);

  const [skillTitle, setSkillTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subskillId, setSubskillId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
  };

  const handleConfirm = () => {
    if (!stepTwoData) {
      navigate(ROUTES.REGISTER_STEP_TWO);
      return;
    }

    login?.(
      {
        id: Date.now(),
        name: stepTwoData.name || 'Skill Swapper',
        avatarUrl: stepTwoData.avatarUrl || '',
        cityId: stepTwoData.cityId ?? 0,
        birthDate: stepTwoData.birthDate ?? '',
        gender: (stepTwoData.gender || 'Мужской') as Gender,
        teachableSkills: subskillId ? [subskillId] : [],
        learningSkills: stepTwoData.subskillId ? [stepTwoData.subskillId] : [],
      },
      'demo-token',
    );

    sessionStorage.removeItem(REGISTRATION_STEP_TWO_STORAGE_KEY);
    setIsPreviewOpen(false);
    navigate(ROUTES.HOME);
  };

  const previewCategoryName = categoryId
    ? skillGroups.find((group) => group.id === categoryId)?.name ?? 'Категория не выбрана'
    : 'Категория не выбрана';

  const previewSubcategoryName = subskillId
    ? skillOptions.find((skill) => skill.id === subskillId)?.name ?? ''
    : '';

  const usingFallbackImages = imagePreviews.length === 0;
  const gallery = usingFallbackImages
    ? [stockMain, stockSecond, stockThird, stockFourth]
    : imagePreviews;

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
            <Title tag='h2' variant='lg'>Укажите, чем вы готовы поделиться</Title>
            <p>Так другие люди смогут увидеть ваши предложения и предложить вам обмен.</p>
          </div>
        </div>
      </div>

      <Modal isOpen={isPreviewOpen} onClose={handleEdit} className={styles.previewModal}>
        <div className={styles.previewModalHeader}>
          <Title tag='h2' variant='lg'>Ваше предложение</Title>
          <p>Пожалуйста, проверьте и подтвердите правильность данных</p>
        </div>
        <div className={styles.previewModalBody}>
          <div className={styles.previewContent}>
            <Title tag='h3' variant='lg'>{skillTitle || 'Название навыка'}</Title>
            <span className={styles.previewCategory}>
              {previewCategoryName}
              {previewSubcategoryName ? ` / ${previewSubcategoryName}` : ''}
            </span>
            <p className={styles.previewDescription}>
              {description || 'Расскажите о навыке, которым готовы поделиться, чтобы другим было проще выбрать именно вас.'}
            </p>
            <div className={styles.previewActions}>
              <Button type='button' variant='secondary' onClick={handleEdit}>
                Редактировать
              </Button>
              <Button type='button' variant='primary' onClick={handleConfirm}>
                Готово
              </Button>
            </div>
          </div>
          <div className={styles.previewGallery}>
            <img src={mainImage} alt={skillTitle || 'Навык'} className={styles.previewMainImage} />
            <div className={styles.previewThumbs}>
              {secondaryImages.map((image) => (
                <img key={image} src={image} alt='Дополнительное изображение' className={styles.previewThumb} />
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
