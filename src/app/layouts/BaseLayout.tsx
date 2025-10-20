import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';
import { Outlet } from 'react-router-dom';
import styles from './baseLayout.module.scss';

function BaseLayout() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default BaseLayout;
