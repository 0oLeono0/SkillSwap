import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './profilePersonalData.module.scss';
import fallbackAvatar from '@/shared/assets/images/avatars/avatar.jpg';
import { Input } from '@/shared/ui/Input';
import { DatePicker } from '@/shared/ui/DatePicker/DatePicker';
import { Button } from '@/shared/ui/button/Button';
import { Title } from '@/shared/ui/Title';
import { useAuth } from '@/app/providers/auth';
import { getCities } from '@/features/Filter/utils';
import {
  formatBirthDate,
  normalizeGenderInput,
  toISODate,
} from './profilePersonalData.helpers';

interface PersonalDataForm {
  email: string;
  name: string;
  birthDate: string;
  gender: string;
  city: string;
  bio: string;
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export function ProfilePersonalData() {
  const { user, updateProfile } = useAuth();
  const cities = useMemo(() => getCities(), []);
  const cityName = useMemo(() => {
    if (!user?.cityId) return '';
    const city = cities.find((option) => option.id === user.cityId);
    return city?.name ?? '';
  }, [cities, user?.cityId]);

  const profileDefaults = useMemo<PersonalDataForm>(
    () => ({
      email: user?.email ?? '',
      name: user?.name ?? '',
      birthDate: formatBirthDate(user?.birthDate),
      gender: user?.gender ?? '',
      city: cityName,
      bio: user?.bio ?? '',
    }),
    [user?.email, user?.name, user?.birthDate, user?.gender, user?.bio, cityName],
  );

  const [formState, setFormState] = useState<PersonalDataForm>(profileDefaults);
  const [savedState, setSavedState] = useState<PersonalDataForm>(profileDefaults);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || fallbackAvatar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormState(profileDefaults);
    setSavedState(profileDefaults);
    setAvatarFile(null);
    setAvatarPreview(user?.avatarUrl || fallbackAvatar);
    setSubmitError(null);
    setSubmitSuccess(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [profileDefaults, user?.avatarUrl]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    [],
  );

  const updateFormField = (field: keyof PersonalDataForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleBirthDateChange = (value: string) => {
    setFormState((prev) => ({ ...prev, birthDate: value }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(user?.avatarUrl || fallbackAvatar);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = previewUrl;
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const handleAvatarPick = () => {
    fileInputRef.current?.click();
  };

  const hasChanges = useMemo(() => {
    return (
      avatarFile !== null ||
      formState.email !== savedState.email ||
      formState.name !== savedState.name ||
      formState.birthDate !== savedState.birthDate ||
      formState.gender !== savedState.gender ||
      formState.city !== savedState.city ||
      formState.bio !== savedState.bio
    );
  }, [avatarFile, formState, savedState]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasChanges) {
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    const trimmedCity = formState.city.trim();
    let cityIdPayload: number | null | undefined = undefined;
    if (!trimmedCity) {
      cityIdPayload = null;
    } else {
      const matchedCity = cities.find((city) => city.name.toLowerCase() === trimmedCity.toLowerCase());
      if (matchedCity) {
        cityIdPayload = matchedCity.id;
      }
    }

    let avatarUrlPayload: string | undefined;
    if (avatarFile) {
      try {
        avatarUrlPayload = await readFileAsDataUrl(avatarFile);
      } catch (error) {
        console.error('[ProfilePersonalData] Failed to read avatar file', error);
        setSubmitError('Не удалось прочитать выбранный файл. Попробуйте другой файл.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await updateProfile({
        email: formState.email.trim(),
        name: formState.name.trim(),
        birthDate: formState.birthDate ? toISODate(formState.birthDate) : null,
        gender: normalizeGenderInput(formState.gender),
        bio: formState.bio.trim() || null,
        ...(cityIdPayload !== undefined ? { cityId: cityIdPayload } : {}),
        ...(avatarUrlPayload ? { avatarUrl: avatarUrlPayload } : {}),
      });
      setSavedState({ ...formState });
      setAvatarFile(null);
      setSubmitSuccess('Данные успешно сохранены');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось сохранить данные';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.personal}>
      <div className={styles.header}>
        <Title tag='h2' variant='lg'>
          Личные данные
        </Title>
        <p className={styles.subtitle}>
          Обновите информацию о себе, чтобы другим было проще находить вас для обмена опытом.
        </p>
      </div>

      <div className={styles.body}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldStack}>
            <Input
              title='Почта'
              type='email'
              value={formState.email}
              onChange={updateFormField('email')}
              placeholder='Ваш email'
              required
            />
            <button
              type='button'
              className={styles.passwordLink}
              onClick={() => console.info('[Profile] Navigate to password change')}
            >
              Изменить пароль
            </button>
          </div>

          <Input
            title='Имя'
            value={formState.name}
            onChange={updateFormField('name')}
            placeholder='Как к вам обращаться'
            required
          />

          <div className={styles.inlineFields}>
            <DatePicker title='Дата рождения' value={formState.birthDate} onChange={handleBirthDateChange} />
            <Input
              title='Пол'
              value={formState.gender}
              onChange={updateFormField('gender')}
              placeholder='Укажите пол'
            />
          </div>

          <Input
            title='Город'
            value={formState.city}
            onChange={updateFormField('city')}
            placeholder='Город проживания'
          />

          <label className={styles.textareaField}>
            <span>О себе</span>
            <textarea
              value={formState.bio}
              onChange={updateFormField('bio')}
              placeholder='Коротко расскажите о себе'
            />
          </label>

          <div className={styles.actions}>
            <Button type='submit' variant='primary' disabled={!hasChanges || isSubmitting}>
              {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
            </Button>
            {submitError && <p className={`${styles.statusMessage} ${styles.statusError}`}>{submitError}</p>}
            {submitSuccess && <p className={`${styles.statusMessage} ${styles.statusSuccess}`}>{submitSuccess}</p>}
          </div>
        </form>

        <div className={styles.avatarCard}>
          <div className={styles.avatarPreview}>
            <img src={avatarPreview} alt='Аватар пользователя' />
            <input
              ref={fileInputRef}
              className={styles.fileInput}
              type='file'
              accept='image/*'
              onChange={handleAvatarChange}
            />
            <button type='button' className={styles.avatarOverlay} onClick={handleAvatarPick}>
              Изменить фото
            </button>
          </div>
          <p className={styles.avatarHint}>Формат JPG или PNG, размер до 5 МБ.</p>
          <Button variant='secondary' type='button' onClick={handleAvatarPick}>
            Загрузить новое фото
          </Button>
        </div>
      </div>
    </div>
  );
}

