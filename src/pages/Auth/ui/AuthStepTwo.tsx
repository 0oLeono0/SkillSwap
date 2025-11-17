import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './authStepTwo.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import { Select, SelectVariant } from '@/shared/ui/Select';
import { DatePicker } from '@/shared/ui/DatePicker/DatePicker';
import { Title } from '@/shared/ui/Title';
import { ROUTES } from '@/shared/constants';
import { getCities, getSkillsGroups } from '@/features/Filter/utils';
import type { Gender } from '@/entities/User/types';
import UserInfoIcon from '@/shared/assets/images/user-info.svg?react';

const REGISTRATION_STEP_TWO_STORAGE_KEY = 'registration:step2';
const REGISTRATION_CREDENTIALS_STORAGE_KEY = 'registration:credentials';

const GENDERS: Array<{ value: Gender | ''; label: string }> = [
  { value: '', label: 'Не указан' },
  { value: 'Мужской', label: 'Мужской' },
  { value: 'Женский', label: 'Женский' },
];

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

interface StepOneCredentials {
  email: string;
  password: string;
}

interface StepTwoStorageData {
  name: string;
  birthDate: string;
  gender: Gender | '';
  cityId: number | null;
  categoryId: number | null;
  subskillId: number | null;
  avatarUrl: string;
}

const AuthStepTwo = () => {
  const navigate = useNavigate();

  const cityOptions = useMemo(() => getCities(), []);
  const skillGroups = useMemo(() => getSkillsGroups(), []);

  const credentials = useMemo<StepOneCredentials | null>(() => {
    const raw = sessionStorage.getItem(REGISTRATION_CREDENTIALS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StepOneCredentials) : null;
  }, []);

  const storedStepTwo = useMemo<StepTwoStorageData | null>(() => {
    const raw = sessionStorage.getItem(REGISTRATION_STEP_TWO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StepTwoStorageData) : null;
  }, []);

  useEffect(() => {
    if (!credentials) {
      navigate(ROUTES.REGISTER);
    }
  }, [credentials, navigate]);

  const [avatarPreview, setAvatarPreview] = useState(storedStepTwo?.avatarUrl ?? '');
  const [name, setName] = useState(storedStepTwo?.name ?? '');
  const [birthDate, setBirthDate] = useState(storedStepTwo?.birthDate ?? '');
  const [gender, setGender] = useState<Gender | ''>(storedStepTwo?.gender ?? '');
  const [cityId, setCityId] = useState<number | null>(storedStepTwo?.cityId ?? null);
  const [categoryId, setCategoryId] = useState<number | null>(storedStepTwo?.categoryId ?? null);
  const [subskillId, setSubskillId] = useState<number | null>(storedStepTwo?.subskillId ?? null);

  const subskillOptions = useMemo(() => {
    if (!categoryId) return [];
    return skillGroups.find((group) => group.id === categoryId)?.skills ?? [];
  }, [categoryId, skillGroups]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setAvatarPreview('');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarPreview(dataUrl);
    } catch (error) {
      console.error('[AuthStepTwo] Failed to read avatar file', error);
      setAvatarPreview('');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    sessionStorage.setItem(
      REGISTRATION_STEP_TWO_STORAGE_KEY,
      JSON.stringify({
        name,
        birthDate,
        gender,
        cityId,
        categoryId,
        subskillId,
        avatarUrl: avatarPreview || '',
      }),
    );

    navigate(ROUTES.REGISTER_STEP_THREE);
  };

  return (
    <section className={styles.auth}>
      <div className={styles.card}>
        <div className={styles.stepIndicator}>Шаг 2 из 3</div>
        <div className={styles.layout}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.avatarUpload}>
              {avatarPreview ? (
                <img src={avatarPreview} alt='Аватар пользователя' />
              ) : (
                <span className={styles.avatarPlaceholder}>+</span>
              )}
              <input type='file' accept='image/*' onChange={handleAvatarChange} hidden />
            </label>

            <Input
              title='Имя'
              placeholder='Введите ваше имя'
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <div className={styles.row}>
              <DatePicker
                title='Дата рождения'
                value={birthDate}
                onChange={setBirthDate}
              />
              <Select
                label='Пол'
                options={GENDERS.map(({ value, label }) => ({ value, label }))}
                value={gender}
                onChange={(value) => setGender(value as Gender | '')}
                placeholder='Не указан'
              />
            </div>

            <Select
              label='Город'
              options={cityOptions.map((city) => ({ value: city.id.toString(), label: city.name }))}
              value={cityId?.toString() ?? ''}
              onChange={(value) => setCityId(value ? Number(value) : null)}
              placeholder='Не указан'
              variant={SelectVariant.Search}
            />

            <Select
              label='Категория навыка, которому хотите научиться'
              options={skillGroups.map((group) => ({ value: group.id.toString(), label: group.name }))}
              value={categoryId?.toString() ?? ''}
              onChange={(value) => {
                setCategoryId(value ? Number(value) : null);
                setSubskillId(null);
              }}
              placeholder='Выберите категорию'
            />

            <Select
              label='Подкатегория навыка, которому хотите научиться'
              options={subskillOptions.map((skill) => ({ value: skill.id.toString(), label: skill.name }))}
              value={subskillId?.toString() ?? ''}
              onChange={(value) => setSubskillId(value ? Number(value) : null)}
              disabled={!categoryId}
              placeholder='Выберите подкатегорию'
            />

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
            <UserInfoIcon className={styles.previewIcon} />
            <Title tag='h2' variant='lg'>Расскажите немного о себе</Title>
            <p>Это поможет другим людям лучше узнать вас, чтобы быстрее подобрать партнёров для обмена.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthStepTwo;
