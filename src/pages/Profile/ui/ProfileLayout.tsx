import { useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import styles from './profileLayout.module.scss';
import { Title } from '@/shared/ui/Title';
import { useAuth } from '@/app/providers/auth';

const BASE_NAV_LINKS = [
  { key: 'requests', label: 'Заявки', to: 'requests' },
  { key: 'exchanges', label: 'Обмены', to: 'exchanges' },
  { key: 'favorites', label: 'Избранное', to: 'favorites' },
  { key: 'skills', label: 'Навыки', to: 'skills' },
  { key: 'personal', label: 'Личные данные', to: '.', end: true },
];

const OWNER_LINK = { key: 'admin', label: 'Администраторы', to: 'admin' };

export function ProfileLayout() {
  const { user } = useAuth();
  const navLinks = useMemo(() => {
    const links = [...BASE_NAV_LINKS];
    if (user?.role === 'owner') {
      links.unshift(OWNER_LINK);
    }
    return links;
  }, [user?.role]);

  return (
    <section className={styles.profile}>
      <div className={styles.container}>
        <Title tag='h1' variant='xl' className={styles.pageTitle}>
          Личный кабинет
        </Title>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <nav className={styles.nav}>
              {navLinks.map(({ key, label, to, end }) => (
                <NavLink
                  key={key}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    clsx(styles.navLink, isActive && styles.navLinkActive)
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className={styles.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
