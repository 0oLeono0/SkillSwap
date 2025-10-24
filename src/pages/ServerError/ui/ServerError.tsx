import { useNavigate } from 'react-router-dom';
import styles from './serverError.module.scss';
import errorIllustration from '@/shared/assets/images/error-500.svg';
import { Button } from '@/shared/ui/button/Button';

function ServerError() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <img
        className={styles.pic}
        src={errorIllustration}
        alt="Ошибка сервера"
      />
      <div className={styles.text}>
        <h2 className={styles.title}>На сервере произошла ошибка</h2>
        <p className={styles.message}>
          Попробуйте позже или вернитесь на главную страницу, чтобы выбрать
          другой раздел.
        </p>
      </div>
      <div className={styles.containerBtn}>
        <Button
          className={styles.button}
          onClick={() => console.info('[ServerError] Report issue')}
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

export default ServerError;
