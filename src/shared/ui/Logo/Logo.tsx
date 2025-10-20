import { Link } from "react-router-dom";
import logo from '@/shared/assets/icons/logo.svg';
import styles from '../../../widgets/Header/ui/header.module.scss';
import { ROUTES } from '@/shared/constants';

export const Logo = () => (
  <Link to={ROUTES.HOME} className={styles.logo}>
    <img src={logo} alt="SkillSwap logo" />
    <span>SkillSwap</span>
  </Link>
);