import { NavLink, Link } from 'react-router-dom';
import styles from './footer.module.scss';
import logo from '@/shared/assets/icons/logo.svg';
import { links as linksData, ROUTES } from '@/shared/constants';

function Footer() {
  return (
    <footer className={styles.footer}>
      <Link to={ROUTES.HOME} className={styles.logo}>
        <img src={logo} alt="Логотип SkillSwap" />
        <span>SkillSwap</span>
      </Link>
      <nav aria-label="Основная навигация футера">
        <ul className={styles.nav}>
          {linksData.map((link) => (
            <li key={link.path} className={styles.item}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.copyright}>SkillSwap — 2025</div>
    </footer>
  );
}

export default Footer;
