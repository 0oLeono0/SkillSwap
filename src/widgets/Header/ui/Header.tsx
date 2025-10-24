import { NavLink } from 'react-router-dom';
import styles from './header.module.scss';
import IcMoon from '@/shared/assets/icons/status/moon.svg?react';
import IcSun from '@/shared/assets/icons/status/sun.svg?react';
import IcSearch from '@/shared/assets/icons/actions/search.svg?react';
import IcChevronDown from '@/shared/assets/icons/navigation/chevron.svg?react';
import { Button } from '@/shared/ui/button/Button';
import { ROUTES } from '@/shared/constants';
import { Logo } from '@/shared/ui/Logo/Logo';
import { SearchInput } from '@/features/SearchInput';
import { useAuth } from '@/app/providers/auth';
import { useTheme } from '@/app/providers/theme';

function HeaderThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="empty"
      onClick={toggleTheme}
      aria-label="Переключить тему"
    >
      {theme === 'dark' ? <IcMoon /> : <IcSun />}
    </Button>
  );
}

function Header() {
  const { isAuthenticated, login, user } = useAuth();

  return (
    <header className={styles.header}>
      <nav aria-label="Основная навигация" className={styles.navGroup}>
        <Logo />

        <ul className={styles.nav}>
          <li>
            <NavLink to={ROUTES.ABOUT} className={styles.link}>
              О проекте
            </NavLink>
          </li>
          <li>
            <NavLink
              to={ROUTES.CATALOG}
              className={`${styles.link} ${styles.skillsLink}`}
            >
              Все навыки
              <IcChevronDown aria-hidden />
            </NavLink>
          </li>
        </ul>

        <div className={styles.searchInput}>
          <SearchInput placeholder="Искать навык" leftIcon={IcSearch} />
        </div>

        <div className={styles.actions}>
          <HeaderThemeToggle />

          {isAuthenticated ? (
            <div className={styles.userInfo}>
              <span>{user?.name ?? 'Пользователь'}</span>
            </div>
          ) : (
            <div className={styles.buttons}>
              <NavLink
                to={ROUTES.LOGIN}
                onClick={(event) => {
                  event.preventDefault();
                  login?.(
                    {
                      id: 1,
                      name: 'Skill Seeker',
                      avatarUrl: '',
                      cityId: 0,
                      birthDate: '',
                      gender: 'Женский',
                      teachableSkills: [],
                      learningSkills: [],
                    },
                    'demo-token',
                  );
                }}
              >
                <Button variant="secondary">Войти</Button>
              </NavLink>
              <NavLink to={ROUTES.REGISTER}>
                <Button variant="primary">Зарегистрироваться</Button>
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
