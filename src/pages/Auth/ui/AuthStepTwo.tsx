import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './authStepTwo.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { DatePicker } from '@/shared/ui/DatePicker/DatePicker';
import { ROUTES } from '@/shared/constants';
import { getSkillsGroups } from '@/features/Filter/utils';
import { loadCatalogBaseData } from '@/pages/Catalog/model/catalogData';
import type { Gender } from '@/entities/User/types';
import { Title } from '@/shared/ui/Title';
import UserInfoIcon from '@/shared/assets/images/user-info.svg?react';

const REGISTRATION_STEP_TWO_STORAGE_KEY = 'registration:step2';

const GENDERS: Array<{ value: Gender | ''; label: string }> = [
  { value: '', label: 'Не указан' },
  { value: 'Мужской', label: 'Мужской' },
  { value: 'Женский', label: 'Женский' },
];

const AuthStepTwo = () => {
  const navigate = useNavigate();

  const catalogData = useMemo(() => loadCatalogBaseData(), []);
  const cityOptions = useMemo(() => catalogData.cityOptions, [catalogData]);
  const skillGroups = useMemo(() => getSkillsGroups(), []);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [cityQuery, setCityQuery] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subskillId, setSubskillId] = useState<number | null>(null);

  const filteredCities = useMemo(() => {
    if (!cityQuery) return cityOptions;
    const normalized = cityQuery.toLowerCase();
    return cityOptions.filter((city) => city.name.toLowerCase().includes(normalized));
  }, [cityOptions, cityQuery]);

  const subskillOptions = useMemo(() => {
    if (!categoryId) return [];
    return skillGroups.find((group) => group.id === categoryId)?.skills ?? [];
  }, [categoryId, skillGroups]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedCity = cityOptions.find((city) => city.name === cityQuery);

    sessionStorage.setItem(
      REGISTRATION_STEP_TWO_STORAGE_KEY,
      JSON.stringify({
        name,
        birthDate,
        gender,
        cityId: selectedCity?.id ?? null,
        categoryId,
        subskillId,
        avatarUrl: avatarFile ? URL.createObjectURL(avatarFile) : '',
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
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} alt='Аватар пользователя' />
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

            <div className={styles.datePicker}>
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
              options={filteredCities.map((city) => ({ value: city.name, label: city.name }))}
              value={cityQuery}
              onChange={(value) => setCityQuery(value as string)}
              placeholder='Не указан'
              variant='search'
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
            <UserInfoIcon />
            <Title tag='h2' variant={'lg'} >Расскажите немного о себе</Title>
            <p>Это поможет другим людям лучше узнать вас и подобрать партнёров для обмена.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthStepTwo;
