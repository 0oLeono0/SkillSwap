import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './authStepOne.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/Input';
import GoogleIcon from '@/shared/assets/icons/actions/google.svg?react';
import AppleIcon from '@/shared/assets/icons/actions/apple.svg?react';
import LightBulbIcon from '@/shared/assets/images/light-bulb.svg?react';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/app/providers/auth';
import type { Gender } from '@/entities/User/types';
import { Title } from '@/shared/ui/Title';

interface AuthStepOneProps {
  isRegistered?: boolean;
}

export const AuthStepOne = ({ isRegistered = false }: AuthStepOneProps) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const defaultGender = 'Мужской' as Gender;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isRegistered) {
      login?.(
        {
          id: 1,
          name: email || 'Skill Seeker',
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
      return;
    }

    navigate(ROUTES.REGISTER_STEP_TWO);
  };

  return (
    <section className={styles.auth}>
      <div className={styles.card}>
        <div className={styles.stepIndicator}>Шаг 1 из 3</div>
        <div className={styles.layout}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.socialButtons}>
              <button type='button'>
                <GoogleIcon />
                Продолжить с Google
              </button>
              <button type='button'>
                <AppleIcon />
                Продолжить с Apple
              </button>
            </div>

            <div className={styles.separator}>или</div>

            <Input
              title='Email'
              placeholder='Введите email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              title='Пароль'
              type='password'
              placeholder='Придумайте надёжный пароль'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hint='Пароль должен содержать не менее 8 символов'
              required
            />

            <Button type='submit' variant='primary'>
              Далее
            </Button>
          </form>

          <div className={styles.preview}>
            <LightBulbIcon />
            <Title tag='h2' variant={'lg'} >Добро пожаловать в SkillSwap!</Title>
            <p>Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
