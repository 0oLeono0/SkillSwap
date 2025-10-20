import { NavLink } from 'react-router-dom';
import styles from './header.module.scss';
import IcMoon from '@/shared/assets/icons/status/moon.svg?react';
import IcSun from '@/shared/assets/icons/status/sun.svg?react';
import IcNotification from '@/shared/assets/icons/content/notification.svg?react';
import IcLike from '@/shared/assets/icons/actions/like.svg?react';
import IcSearch from '@/shared/assets/icons/actions/search.svg?react';
import { Button } from '@/shared/ui/button/Button';
import { ROUTES } from '@/shared/constants';
import { Logo } from '@/shared/ui/Logo/Logo';
import { SearchInput } from '@/features/SearchInput';
import { useAuth } from '@/app/providers/auth';
import { useTheme } from '@/app/providers/theme';

type HeaderProps = {};

const headerIcons = [IcNotification, IcLike];

function HeaderThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant='empty' onClick={toggleTheme}>
      {theme === 'dark' ? <IcMoon /> : <IcSun />}
    </Button>
  );
}

function Header({}: HeaderProps) {
  const { isAuthenticated, login, user } = useAuth();

  return (
    <header className={styles.header}>
      <nav aria-label='Header navigation' className={styles.navGroup}>
        <Logo />
        <ul className={styles.nav}>
          <li className={styles.liGroup}>
            <NavLink to={ROUTES.ABOUT} className={styles.link}>
              О проекте
            </NavLink>

            {/* TODO: заменить link skills на select при мерже */}
            <NavLink to={`${ROUTES.PROFILE.ROOT}/${ROUTES.PROFILE.CHILDREN.SKILLS}`} className={styles.link}>
              Все навыки
            </NavLink>
          </li>

          <li className={styles.searchInput}>
            <SearchInput placeholder='Искать навыки' leftIcon={IcSearch} />
          </li>

          {isAuthenticated && (
            <>
              <li className={styles.icons}>
                <HeaderThemeToggle />

                {/* TODO: заменить эти линки потом на кнопку избранного и на уведомления */}
                {headerIcons.map((Icon, i) => (
                  <Button key={i} variant='empty'>
                    <Icon />
                  </Button>
                ))}
              </li>
              {/* TODO: пусть тут будет пока что луна, потом заменить на аватарку пользователся и его имя */}
              <li>
                <span> {user?.name} </span>
              </li>
              <li>
                <IcMoon />
              </li>
            </>
          )}

          {!isAuthenticated && (
            <>
              <li>
                <HeaderThemeToggle />
              </li>

              <li className={styles.buttons}>
                {/* TODO: сделано для переключения header со входом, потом заменить на переход страницы входа или модальное окно входа */}
                <NavLink
                  to={ROUTES.LOGIN}
                  onClick={(evt) => {
                    evt.preventDefault();
                    login?.(
                      {
                        id: 1, name: 'MOON',
                        avatarUrl: '',
                        cityId: 0,
                        birthDate: '',
                        gender: 'Мужской',
                        teachableSkills: [],
                        learningSkills: []
                      },
                      'testMOON'
                    );
                  }}
                >
                  <Button variant='secondary'>Вход</Button>
                </NavLink>
                <NavLink to={ROUTES.REGISTER}>
                  <Button variant={'primary'}>Зарегистрироваться</Button>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
