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

  const skillOptions = useMemo(() => {
    if (!categoryId) return [];
    return skillGroups.find((group) => group.id === categoryId)?.skills ?? [];
  }, [categoryId, skillGroups]);

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setImages(files);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

    console.info('[Registration] Step3 payload', {
      skillTitle,
      categoryId,
      subskillId,
      description,
      imagesCount: images.length,
    });

    navigate(ROUTES.HOME);
  };

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
    </section>
  );
};

export default AuthStepThree;
