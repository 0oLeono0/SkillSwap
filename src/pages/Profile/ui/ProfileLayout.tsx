import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import styles from './profileLayout.module.scss';
import { Title } from '@/shared/ui/Title';

const NAV_LINKS = [
  { key: 'requests', label: 'Заявки', to: 'requests' },
  { key: 'exchanges', label: 'Мои обмены', to: 'exchanges' },
  { key: 'favorites', label: 'Избранное', to: 'favorites' },
  { key: 'skills', label: 'Мои навыки', to: 'skills' },
  { key: 'personal', label: 'Личные данные', to: '.', end: true },
];

export function ProfileLayout() {
  return (
    <section className={styles.profile}>
      <div className={styles.container}>
        <Title tag='h1' variant='xl' className={styles.pageTitle}>
          Личный кабинет
        </Title>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <nav className={styles.nav}>
              {NAV_LINKS.map(({ key, label, to, end }) => (
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
