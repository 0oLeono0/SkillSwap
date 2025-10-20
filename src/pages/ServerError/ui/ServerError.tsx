import styles from './serverError.module.scss'
import error500 from '@/shared/assets/images/error-500.svg'
import { Button } from '@/shared/ui'
import { useNavigate } from 'react-router-dom'

function ServerError() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  }

  return (
    <div className={styles.container}>
     <img className={styles.pic} src={error500} alt="ничего не найдено" /> 
     <div className={styles.text}>
      <h2 className={styles.title}>На сервере произошла ошибка</h2>
      <p className={styles.message}>Попробуйте позже или вернитесь на главную страницу</p>
     </div>
     <div className={styles.containerBtn}>
      <Button className={styles.button} onClick={() => console.error("Report: server error")} variant='secondary'>Сообщить об ошибке</Button>
      <Button className={styles.button} onClick={handleClick} variant='primary'>На главную</Button>
     </div>
    </div>
  )
}

export default ServerError
