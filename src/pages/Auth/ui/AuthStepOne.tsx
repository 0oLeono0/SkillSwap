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
import { Title } from '@/shared/ui/Title';
import { ApiError } from '@/shared/api/auth';
import { useRegistrationDraft } from '@/pages/Auth/model/RegistrationContext';

interface AuthStepOneProps {
  isRegistered?: boolean;
}

export const AuthStepOne = ({ isRegistered = false }: AuthStepOneProps) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setCredentials, clear } = useRegistrationDraft();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isRegistered) {
      try {
        setIsSubmitting(true);
        await login({ email, password });
        clear();
        navigate(ROUTES.HOME);
      } catch (loginError) {
        if (loginError instanceof ApiError) {
          setError(loginError.message);
        } else {
          setError('Неизвестная ошибка');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setCredentials({ email, password });
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
                Войти с Google
              </button>
              <button type='button'>
                <AppleIcon />
                Войти с Apple
              </button>
            </div>

            <div className={styles.separator}>или</div>

            <Input
              title='Email'
              placeholder='Введите email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              data-testid='email-input'
              name='email'
              required
            />
            <Input
              title='Пароль'
              type='password'
              placeholder='Введите пароль'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              data-testid='password-input'
              name='password'
              hint='Пароль должен содержать не менее 8 символов'
              required
            />

            {error && <p className={styles.errorMessage}>{error}</p>}

            <Button
              type='submit'
              variant='primary'
              disabled={isRegistered && isSubmitting}
              data-testid='submit-button'>
              Войти
            </Button>
          </form>

          <div className={styles.preview}>
            <LightBulbIcon />
            <Title tag='h2' variant='lg'>
              Советы по регистрации в SkillSwap!
            </Title>
            <p>Регистрация в SkillSwap — это быстрый и простой процесс.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
