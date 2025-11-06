import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { NavLink, createSearchParams, useNavigate } from 'react-router-dom';
import styles from './header.module.scss';
import IcMoon from '@/shared/assets/icons/status/moon.svg?react';
import IcSun from '@/shared/assets/icons/status/sun.svg?react';
import IcSearch from '@/shared/assets/icons/actions/search.svg?react';
import IcChevronDown from '@/shared/assets/icons/navigation/chevron.svg?react';
import IconBriefcase from '@/shared/assets/icons/categories/briefcase.svg?react';
import IconPalette from '@/shared/assets/icons/categories/palette.svg?react';
import IconGlobal from '@/shared/assets/icons/categories/global.svg?react';
import IconBook from '@/shared/assets/icons/categories/book.svg?react';
import IconHome from '@/shared/assets/icons/categories/home.svg?react';
import IconLifestyle from '@/shared/assets/icons/categories/lifestyle.svg?react';
import { Button } from '@/shared/ui/button/Button';
import { ROUTES } from '@/shared/constants';
import { Logo } from '@/shared/ui/Logo/Logo';
import { SearchInput } from '@/features/SearchInput';
import { useAuth } from '@/app/providers/auth';
import { useTheme } from '@/app/providers/theme';
import { getSkillsGroups } from '@/features/Filter/utils';
import { Title } from '@/shared/ui/Title';

const categoryIcons: Record<number, FC | undefined> = {
  1: IconBriefcase,
  2: IconPalette,
  3: IconGlobal,
  4: IconBook,
  5: IconHome,
  6: IconLifestyle
};

const categoryThemes: Record<number, { bg: string; color: string }> = {
  1: { bg: '#EEE7F7', color: '#253017' },
  2: { bg: '#F7E7F2', color: '#253017' },
  3: { bg: '#EBE5C5', color: '#253017' },
  4: { bg: '#E7F2F6', color: '#253017' },
  5: { bg: '#F7EBE5', color: '#253017' },
  6: { bg: '#E9F7E7', color: '#253017' }
};

function HeaderThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant='empty' onClick={toggleTheme} aria-label='Переключить тему'>
      {theme === 'dark' ? <IcMoon /> : <IcSun />}
    </Button>
  );
}

function Header() {
  const { isAuthenticated, user } = useAuth();
  const skillGroups = useMemo(() => getSkillsGroups(), []);
  const [isSkillsMenuOpen, setIsSkillsMenuOpen] = useState(false);
  const skillsToggleRef = useRef<HTMLButtonElement | null>(null);
  const skillsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSkillsMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        skillsMenuRef.current &&
        !skillsMenuRef.current.contains(target) &&
        skillsToggleRef.current &&
        !skillsToggleRef.current.contains(target)
      ) {
        setIsSkillsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSkillsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSkillsMenuOpen]);

  const toggleSkillsMenu = () => {
    setIsSkillsMenuOpen((prev) => !prev);
  };

  const closeSkillsMenu = () => setIsSkillsMenuOpen(false);

  const navigate = useNavigate();

  const handleSkillShortcut = (skillId: number) => {
    navigate({
      pathname: ROUTES.HOME,
      search: createSearchParams({
        skills: String(skillId),
        mode: 'wantToLearn'
      }).toString()
    });
    closeSkillsMenu();
  };

  return (
    <header className={styles.header}>
      <nav aria-label='Основная навигация' className={styles.navGroup}>
        <Logo />

        <ul className={styles.nav}>
          <li>
            <NavLink to={ROUTES.ABOUT} className={styles.link}>
              О проекте
            </NavLink>
          </li>
          <li>
            <div className={styles.skillsNavItem}>
              <button
                type='button'
                ref={skillsToggleRef}
                className={`${styles.link} ${styles.skillsToggle} ${
                  isSkillsMenuOpen ? styles.skillsToggleOpen : ''
                }`}
                aria-expanded={isSkillsMenuOpen}
                aria-haspopup='true'
                onClick={toggleSkillsMenu}
              >
                Все навыки
                <IcChevronDown aria-hidden className={styles.skillsChevron} />
              </button>
              {isSkillsMenuOpen && (
                <div
                  className={styles.skillsDropdown}
                  ref={skillsMenuRef}
                  role='menu'
                  aria-label='Категории навыков'
                >
                  <div className={styles.skillsDropdownContent}>
                    {skillGroups.map((group) => {
                      const CategoryIcon = categoryIcons[group.id];
                      const theme = categoryThemes[group.id];
                      return (
                        <div key={group.id} className={styles.skillsGroup}>
                          <div className={styles.skillsGroupHeader}>
                            {CategoryIcon && (
                              <span
                                className={styles.skillsGroupIcon}
                                style={
                                  theme
                                    ? {
                                        backgroundColor: theme.bg,
                                        color: theme.color
                                      }
                                    : undefined
                                }
                              >
                                <CategoryIcon aria-hidden />
                              </span>
                            )}
                            <Title
                              className={styles.skillsGroupTitle}
                              tag={'h3'}
                              variant={'lg'}
                            >
                              {group.name}
                            </Title>
                          </div>
                          <ul className={styles.skillsList}>
                            {group.skills.map((skill) => (
                              <li key={skill.id}>
                                <button
                                  type='button'
                                  className={styles.skillsItem}
                                  onClick={() => handleSkillShortcut(skill.id)}
                                >
                                  {skill.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </li>
        </ul>

        <div className={styles.searchInput}>
          <SearchInput placeholder='Искать навыки' leftIcon={IcSearch} />
        </div>

        <div className={styles.actions}>
          <HeaderThemeToggle />

          {isAuthenticated ? (
            <div className={styles.userInfo}>
              <span>{user?.name ?? 'Пользователь'}</span>
            </div>
          ) : (
            <div className={styles.buttons}>
              <NavLink to={ROUTES.LOGIN}>
                <Button variant='secondary'>Войти</Button>
              </NavLink>
              <NavLink to={ROUTES.REGISTER}>
                <Button variant='primary'>Зарегистрироваться</Button>
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
