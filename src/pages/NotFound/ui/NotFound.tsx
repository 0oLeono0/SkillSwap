import { useNavigate } from 'react-router-dom';
import styles from './notFound.module.scss';
import errorIllustration from '@/shared/assets/images/error-404.svg';
import { Button } from '@/shared/ui/button/Button';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <img
        className={styles.pic}
        src={errorIllustration}
        alt="Страница 404"
      />
      <div className={styles.text}>
        <h2 className={styles.title}>Страница не найдена</h2>
        <p className={styles.message}>
          К сожалению, эта страница недоступна. Вернитесь на главную страницу
          или попробуйте позже.
        </p>
      </div>
      <div className={styles.containerBtn}>
        <Button
          className={styles.button}
          onClick={() => console.info('[NotFound] Report issue')}
          variant="secondary"
        >
          Сообщить об ошибке
        </Button>
        <Button
          className={styles.button}
          onClick={() => navigate('/')}
          variant="primary"
        >
          На главную
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
