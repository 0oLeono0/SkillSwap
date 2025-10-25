import { Outlet, useNavigate } from 'react-router-dom';
import styles from './authLayout.module.scss';
import { Logo } from '@/shared/ui/Logo/Logo';

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.authLayout}>
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>
        <button
          type='button'
          className={styles.closeButton}
          onClick={() => navigate('/')}
        >
          Закрыть ✕
        </button>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
