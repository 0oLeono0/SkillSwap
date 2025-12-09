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
import { useRegistrationDraft } from '@/pages/Auth/model/RegistrationContext';
import SchoolBoardIcon from '@/shared/assets/images/school-board.svg?react';
import stockMain from '@/shared/assets/images/stock/stock.jpg';
import stockSecond from '@/shared/assets/images/stock/stock2.jpg';
import stockThird from '@/shared/assets/images/stock/stock3.jpg';
import stockFourth from '@/shared/assets/images/stock/stock4.jpg';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ApiError, type ApiUserSkill } from '@/shared/api/auth';

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

const AuthStepThree = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { skillGroups } = useFiltersBaseData();
  const { credentials, stepTwo: stepTwoData, clear } = useRegistrationDraft();

  useEffect(() => {
    if (!stepTwoData || !credentials) {
      navigate(ROUTES.REGISTER_STEP_TWO);
    }
  }, [stepTwoData, credentials, navigate]);

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
      findSkillName(groupId, stepTwoData.subskillId) ?? 'Р СњР В°Р Р†РЎвЂ№Р С” Р Т‘Р В»РЎРЏ Р С‘Р В·РЎС“РЎвЂЎР ВµР Р…Р С‘РЎРЏ';

    return {
      id: generateSkillId(),
      title,
      categoryId: groupId,
      subcategoryId: stepTwoData.subskillId,
      description: 'Р ТђР С•РЎвЂЎРЎС“ Р С‘Р В·РЎС“РЎвЂЎР С‘РЎвЂљРЎРЉ РЎРЊРЎвЂљР С•РЎвЂљ Р Р…Р В°Р Р†РЎвЂ№Р С”',
      imageUrls: STOCK_IMAGES.slice(1),
    };
  };

  const buildTeachableSkillPayload = async (): Promise<ApiUserSkill | null> => {
    if (typeof subskillId !== 'number' || typeof categoryId !== 'number') {
      setError('Р вЂ™РЎвЂ№Р В±Р ВµРЎР‚Р С‘РЎвЂљР Вµ Р С”Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎР‹ Р С‘ Р С—Р С•Р Т‘Р С”Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎР‹ Р Т‘Р В»РЎРЏ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°');
      return null;
    }

    const subskillName = findSkillName(categoryId, subskillId);
    const trimmedTitle = skillTitle.trim() || subskillName || 'Р СљР С•Р в„– Р Р…Р В°Р Р†РЎвЂ№Р С”';
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
        trimmedDescription || 'Р Р‡ Р С—Р С•Р Т‘Р ВµР В»РЎР‹РЎРѓРЎРЉ Р С—Р С•Р Т‘РЎР‚Р С•Р В±Р Р…Р С•РЎРѓРЎвЂљРЎРЏР СР С‘ Р С•Р В± РЎРЊРЎвЂљР С•Р С Р Р…Р В°Р Р†РЎвЂ№Р С”Р Вµ Р С—Р С•Р В·Р В¶Р Вµ',
      imageUrls: imageUrls.length ? imageUrls : STOCK_IMAGES,
    };
  };

  const handleConfirm = async () => {
    if (!stepTwoData || !credentials) {
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
        email: credentials.email,
        password: credentials.password,
        name: stepTwoData.name || 'Skill Swapper',
        avatarUrl: avatarUrlPayload,
        cityId: stepTwoData.cityId ?? undefined,
        birthDate: stepTwoData.birthDate || undefined,
        gender: stepTwoData.gender || undefined,
        bio: trimmedDescription || undefined,
        learningSkills: learningSkill ? [learningSkill] : undefined,
        teachableSkills: [teachableSkill],
      });
      clear();
      setIsPreviewOpen(false);
      navigate(ROUTES.HOME);
    } catch (registerError) {
      if (registerError instanceof ApiError) {
        setError(registerError.message);
      } else {
        setError('Р СџРЎР‚Р С•Р С‘Р В·Р С•РЎв‚¬Р В»Р В° Р Р…Р ВµР С‘Р В·Р Р†Р ВµРЎРѓРЎвЂљР Р…Р В°РЎРЏ Р С•РЎв‚¬Р С‘Р В±Р С”Р В° Р С—РЎР‚Р С‘ РЎР‚Р ВµР С–Р С‘РЎРѓРЎвЂљРЎР‚Р В°РЎвЂ Р С‘Р С‘. Р СџР С•Р В¶Р В°Р В»РЎС“Р в„–РЎРѓРЎвЂљР В°, Р С—Р С•Р С—РЎР‚Р С•Р В±РЎС“Р в„–РЎвЂљР Вµ Р С—Р С•Р В·Р В¶Р Вµ.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
const previewCategoryName = categoryId
  ? skillGroups.find((group) => group.id === categoryId)?.name ?? 'Р СњР ВµР С‘Р В·Р Р†Р ВµРЎРѓРЎвЂљР Р…Р В°РЎРЏ Р С”Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎРЏ'
  : 'Р С™Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎРЏ Р Р…Р Вµ Р Р†РЎвЂ№Р В±РЎР‚Р В°Р Р…Р В°';

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
        <div className={styles.stepIndicator}>Р РЃР В°Р С– 3 Р С‘Р В· 3</div>
        <div className={styles.layout}>
            <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              title='Р СњР В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°'
              placeholder='Р вЂ™Р Р†Р ВµР Т‘Р С‘РЎвЂљР Вµ Р Р…Р В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ Р Р†Р В°РЎв‚¬Р ВµР С–Р С• Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°'
              value={skillTitle}
              onChange={(event) => setSkillTitle(event.target.value)}
              data-testid='skill-title-input'
              required
            />

            <Select
              label='Р С™Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎРЏ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°'
              options={skillGroups.map((group) => ({ value: group.id.toString(), label: group.name }))}
              value={categoryId?.toString() ?? ''}
              onChange={(value) => {
              setCategoryId(value ? Number(value) : null);
              setSubskillId(null);
              }}
              data-testid='category-select'
              placeholder='Р вЂ™РЎвЂ№Р В±Р ВµРЎР‚Р С‘РЎвЂљР Вµ Р С”Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎР‹ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°'
            />

            <Select
              label='Р СџР С•Р Т‘Р С”Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎРЏ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°'
              options={skillOptions.map((skill) => ({ value: skill.id.toString(), label: skill.name }))}
              value={subskillId?.toString() ?? ''}
              onChange={(value) => setSubskillId(value ? Number(value) : null)}
              data-testid='subskill-select'
              placeholder='Р вЂ™РЎвЂ№Р В±Р ВµРЎР‚Р С‘РЎвЂљР Вµ Р С—Р С•Р Т‘Р С”Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎР‹ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°'
              disabled={!categoryId}
            />

            <label className={styles.textareaLabel}>
              Р С›Р С—Р С‘РЎРѓР В°Р Р…Р С‘Р Вµ
              <textarea
              className={styles.textarea}
              placeholder='Р С™Р С•РЎР‚Р С•РЎвЂљР С”Р С• Р С•Р С—Р С‘РЎв‚¬Р С‘РЎвЂљР Вµ, РЎвЂЎР ВµР СРЎС“ Р СР С•Р В¶Р ВµРЎвЂљР Вµ Р Р…Р В°РЎС“РЎвЂЎР С‘РЎвЂљРЎРЉ'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              data-testid='description-textarea'
              />
            </label>

            <label className={styles.dropzone}>
              <span className={styles.dropzoneTitle}>Р СџР ВµРЎР‚Р ВµРЎвЂљР В°РЎвЂ°Р С‘РЎвЂљР Вµ Р С‘Р В»Р С‘ Р Р†РЎвЂ№Р В±Р ВµРЎР‚Р С‘РЎвЂљР Вµ Р С‘Р В·Р С•Р В±РЎР‚Р В°Р В¶Р ВµР Р…Р С‘РЎРЏ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°</span>
              <span className={styles.dropzoneHint}>Р вЂ™РЎвЂ№Р В±РЎР‚Р В°РЎвЂљРЎРЉ Р С‘Р В·Р С•Р В±РЎР‚Р В°Р В¶Р ВµР Р…Р С‘РЎРЏ</span>
              <input type='file' accept='image/*' multiple hidden onChange={handleImagesChange} />
              {images.length > 0 && (
              <span className={styles.dropzoneMeta}>Р вЂ™РЎвЂ№Р В±РЎР‚Р В°Р Р…Р С• РЎвЂћР В°Р в„–Р В»Р С•Р Р†: {images.length}</span>
              )}
            </label>

            <div className={styles.actions}>
              <Button type='button' variant='secondary' onClick={() => navigate(-1)}>
              Р СњР В°Р В·Р В°Р Т‘
              </Button>
              <Button type='submit' variant='primary' data-testid='preview-submit'>
              Р СџРЎР‚Р С•Р Т‘Р С•Р В»Р В¶Р С‘РЎвЂљРЎРЉ
              </Button>
            </div>
            </form>

          <div className={styles.preview}>
            <SchoolBoardIcon />
            <Title tag='h2' variant='lg'>Р СџРЎР‚Р ВµР Т‘Р Р†Р В°РЎР‚Р С‘РЎвЂљР ВµР В»РЎРЉР Р…РЎвЂ№Р в„– Р С—РЎР‚Р С•РЎРѓР СР С•РЎвЂљРЎР‚ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°</Title>
            <p>
              Р вЂ”Р Т‘Р ВµРЎРѓРЎРЉ Р С—Р С•Р С”Р В°Р В·Р В°Р Р… Р С—РЎР‚Р ВµР Т‘Р Р†Р В°РЎР‚Р С‘РЎвЂљР ВµР В»РЎРЉР Р…РЎвЂ№Р в„– Р С—РЎР‚Р С•РЎРѓР СР С•РЎвЂљРЎР‚ Р Р†Р В°РЎв‚¬Р ВµР С–Р С• Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°. Р Р€Р В±Р ВµР Т‘Р С‘РЎвЂљР ВµРЎРѓРЎРЉ, РЎвЂЎРЎвЂљР С• Р Р…Р В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ, Р С”Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎРЏ, Р С•Р С—Р С‘РЎРѓР В°Р Р…Р С‘Р Вµ Р С‘ Р С‘Р В·Р С•Р В±РЎР‚Р В°Р В¶Р ВµР Р…Р С‘РЎРЏ
              Р Р†РЎвЂ№Р С–Р В»РЎРЏР Т‘РЎРЏРЎвЂљ РЎвЂљР В°Р С”, Р С”Р В°Р С” Р Р†РЎвЂ№ РЎвЂ¦Р С•РЎвЂљР С‘РЎвЂљР Вµ. Р В§РЎвЂљР С•Р В±РЎвЂ№ Р Р†Р Р…Р ВµРЎРѓРЎвЂљР С‘ Р С‘Р В·Р СР ВµР Р…Р ВµР Р…Р С‘РЎРЏ РІР‚вЂќ Р Р…Р В°Р В¶Р СР С‘РЎвЂљР Вµ Р’В«Р В Р ВµР Т‘Р В°Р С”РЎвЂљР С‘РЎР‚Р С•Р Р†Р В°РЎвЂљРЎРЉР’В», РЎвЂЎРЎвЂљР С•Р В±РЎвЂ№ Р С—Р С•Р Т‘РЎвЂљР Р†Р ВµРЎР‚Р Т‘Р С‘РЎвЂљРЎРЉ Р С‘ Р В·Р В°Р Р†Р ВµРЎР‚РЎв‚¬Р С‘РЎвЂљРЎРЉ РЎР‚Р ВµР С–Р С‘РЎРѓРЎвЂљРЎР‚Р В°РЎвЂ Р С‘РЎР‹ РІР‚вЂќ Р Р…Р В°Р В¶Р СР С‘РЎвЂљР Вµ Р’В«Р СџР С•Р Т‘РЎвЂљР Р†Р ВµРЎР‚Р Т‘Р С‘РЎвЂљРЎРЉР’В».
            </p>
          </div>
        </div>
      </div>

      <Modal isOpen={isPreviewOpen} onClose={handleEdit} className={styles.previewModal}>
        <div className={styles.previewModalHeader}>
          <Title tag='h2' variant='lg'>Р СџРЎР‚Р ВµР Т‘Р Р†Р В°РЎР‚Р С‘РЎвЂљР ВµР В»РЎРЉР Р…РЎвЂ№Р в„– Р С—РЎР‚Р С•РЎРѓР СР С•РЎвЂљРЎР‚ Р С‘ Р С—Р С•Р Т‘РЎвЂљР Р†Р ВµРЎР‚Р В¶Р Т‘Р ВµР Р…Р С‘Р Вµ</Title>
          <p>
            Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚РЎРЉРЎвЂљР Вµ Р С‘Р Р…РЎвЂћР С•РЎР‚Р СР В°РЎвЂ Р С‘РЎР‹ Р С• Р Р…Р В°Р Р†РЎвЂ№Р С”Р Вµ: Р Р…Р В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ, Р С”Р В°РЎвЂљР ВµР С–Р С•РЎР‚Р С‘РЎРЏ, Р С•Р С—Р С‘РЎРѓР В°Р Р…Р С‘Р Вµ Р С‘ Р С‘Р В·Р С•Р В±РЎР‚Р В°Р В¶Р ВµР Р…Р С‘РЎРЏ. Р вЂўРЎРѓР В»Р С‘ Р Р†РЎРѓРЎвЂ Р Р†Р ВµРЎР‚Р Р…Р С• РІР‚вЂќ Р Р…Р В°Р В¶Р СР С‘РЎвЂљР Вµ Р’В«Р СџР С•Р Т‘РЎвЂљР Р†Р ВµРЎР‚Р Т‘Р С‘РЎвЂљРЎРЉР’В» Р Т‘Р В»РЎРЏ Р В·Р В°Р Р†Р ВµРЎР‚РЎв‚¬Р ВµР Р…Р С‘РЎРЏ РЎР‚Р ВµР С–Р С‘РЎРѓРЎвЂљРЎР‚Р В°РЎвЂ Р С‘Р С‘; РЎвЂЎРЎвЂљР С•Р В±РЎвЂ№ Р Р†Р Р…Р ВµРЎРѓРЎвЂљР С‘ Р С‘Р В·Р СР ВµР Р…Р ВµР Р…Р С‘РЎРЏ РІР‚вЂќ Р Р…Р В°Р В¶Р СР С‘РЎвЂљР Вµ Р’В«Р В Р ВµР Т‘Р В°Р С”РЎвЂљР С‘РЎР‚Р С•Р Р†Р В°РЎвЂљРЎРЉР’В».
          </p>
        </div>
        <div className={styles.previewModalBody}>
          <div className={styles.previewContent}>
            <Title tag='h2' variant='lg'>{skillTitle || 'Р СњР В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°'}</Title>
            <span className={styles.previewCategory}>
              {previewCategoryName}
              {previewSubcategoryName ? ` / ${previewSubcategoryName}` : ''}
            </span>
            <p className={styles.previewDescription}>
              {description || 'Р С›Р С—Р С‘РЎРѓР В°Р Р…Р С‘Р Вµ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°, Р Р†Р С”Р В»РЎР‹РЎвЂЎР В°РЎРЏ Р ВµР С–Р С• Р С•РЎРѓР С•Р В±Р ВµР Р…Р Р…Р С•РЎРѓРЎвЂљР С‘ Р С‘ Р С—РЎР‚Р ВµР С‘Р СРЎС“РЎвЂ°Р ВµРЎРѓРЎвЂљР Р†Р В°, Р Т‘Р С•Р В»Р В¶Р Р…Р С• Р В±РЎвЂ№РЎвЂљРЎРЉ РЎвЂЎР ВµРЎвЂљР С”Р С‘Р С Р С‘ Р С‘Р Р…РЎвЂћР С•РЎР‚Р СР В°РЎвЂљР С‘Р Р†Р Р…РЎвЂ№Р С. Р РЎРѓР С—Р С•Р В»РЎРЉР В·РЎС“Р в„–РЎвЂљР Вµ Р С—РЎР‚Р С•РЎРѓРЎвЂљРЎвЂ№Р Вµ Р С‘ Р С—Р С•Р Р…РЎРЏРЎвЂљР Р…РЎвЂ№Р Вµ РЎвЂћР С•РЎР‚Р СРЎС“Р В»Р С‘РЎР‚Р С•Р Р†Р С”Р С‘, Р С‘Р В·Р В±Р ВµР С–Р В°Р в„–РЎвЂљР Вµ РЎРѓР В»Р С•Р В¶Р Р…РЎвЂ№РЎвЂ¦ РЎвЂљР ВµРЎР‚Р СР С‘Р Р…Р С•Р Р† Р С‘ Р В¶Р В°РЎР‚Р С–Р С•Р Р…Р В°.'}
            </p>
            <div className={styles.previewActions}>
              <Button type='button' variant='secondary' onClick={handleEdit} data-testid='edit-button'>
                Р В Р ВµР Т‘Р В°Р С”РЎвЂљР С‘РЎР‚Р С•Р Р†Р В°РЎвЂљРЎРЉ
              </Button>
              {error && <p className={styles.errorMessage}>{error}</p>}
              <Button type='button' variant='primary' onClick={handleConfirm} disabled={isSubmitting} data-testid='confirm-button'>
                Р СџР С•Р Т‘РЎвЂљР Р†Р ВµРЎР‚Р Т‘Р С‘РЎвЂљРЎРЉ
              </Button>
            </div>
          </div>
          <div className={styles.previewGallery}>
            <img src={mainImage} alt={skillTitle || 'Р СњР В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°'} className={styles.previewMainImage} />
            <div className={styles.previewThumbs}>
              {secondaryImages.map((image) => (
                <img key={image} src={image} alt='Р СњР В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ Р Р…Р В°Р Р†РЎвЂ№Р С”Р В°' className={styles.previewThumb} />
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
