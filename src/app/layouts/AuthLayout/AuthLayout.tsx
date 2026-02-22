import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './authLayout.module.scss';
import { Logo } from '@/shared/ui/Logo/Logo';
import { RegistrationProvider } from '@/pages/Auth/model/RegistrationContext';
import { ROUTES } from '@/shared/constants';
import { resolveAuthRedirectPath } from '@/shared/lib/router/authRedirect';

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    const nextPath = resolveAuthRedirectPath(location.state, ROUTES.HOME);
    navigate(nextPath, { replace: true });
  };

  return (
    <div className={styles.authLayout}>
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>
        <button
          type='button'
          className={styles.closeButton}
          onClick={handleClose}
        >
          Закрыть ✕
        </button>
      </header>
      <main className={styles.content}>
        <RegistrationProvider>
          <Outlet />
        </RegistrationProvider>
      </main>
    </div>
  );
};

export default AuthLayout;
