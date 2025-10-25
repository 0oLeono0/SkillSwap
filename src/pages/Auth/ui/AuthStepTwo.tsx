import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './authStepOne.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/app/providers/auth';
import type { Gender } from '@/entities/User/types';

export const AuthStepTwo = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  const defaultGender = 'Мужской' as Gender;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    login?.(
      {
        id: Date.now(),
        name: name || 'Skill Swapper',
        avatarUrl: '',
        cityId: 0,
        birthDate: '',
        gender: defaultGender,
        teachableSkills: [],
        learningSkills: []
      },
      'demo-token'
    );
    navigate(ROUTES.HOME);
  };

  return (
    <section className={styles.auth}>
      <div className={styles.card}>
        <div className={styles.stepIndicator}>Шаг 2 из 3</div>
        <div className={styles.layout}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Расскажите о себе</h1>
            <p className={styles.description}>Чтобы продолжить регистрацию, заполните данные профиля.</p>

            <Input
              title='Имя'
              placeholder='Введите имя'
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <Input
              title='Город'
              placeholder='Например, Москва'
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
            />

            <Button type='submit' variant='primary'>
              Готово
            </Button>
          </form>

          <div className={styles.preview}>
            <div className={styles.previewIcon}>🌱</div>
            <h2>Ещё пару шагов!</h2>
            <p>Заполните профиль и расскажите, чем хотите поделиться.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
