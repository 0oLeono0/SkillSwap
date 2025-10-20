import { Footer } from '@/widgets/Footer';
import { Outlet } from 'react-router-dom';
import styles from './baseLayout.module.scss';

function BaseLayout() {
  return (
    <div className={styles.app}>
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
}

export default BaseLayout;
