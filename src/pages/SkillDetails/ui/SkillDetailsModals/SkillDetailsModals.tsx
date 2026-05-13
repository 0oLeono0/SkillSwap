import type { ReactElement } from 'react';
import styles from './SkillDetailsModals.module.scss';
import NotificationIcon from '@/shared/assets/icons/content/notification.svg?react';
import OkIcon from '@/shared/assets/icons/status/done.svg?react';
import { Button } from '@/shared/ui/button/Button';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Title } from '@/shared/ui/Title';
import type { SkillDetailsModalsProps } from './SkillDetailsModals.types';

export const SkillDetailsModals = ({
  isAuthModalOpen,
  isSuccessModalOpen,
  onCloseAuthModal,
  onCloseSuccessModal,
  onLoginRedirect,
  onRegisterRedirect
}: SkillDetailsModalsProps): ReactElement => (
  <>
    <Modal isOpen={isAuthModalOpen} onClose={onCloseAuthModal}>
      <div className={styles.authPrompt}>
        <div className={styles.modalIcon}>
          <OkIcon />
        </div>
        <Title tag='h3' variant='lg'>
          Чтобы предложить обмен, войдите или зарегистрируйтесь
        </Title>
        <p>
          После авторизации вы сможете отправлять запросы авторам и следить за
          статусом обменов в личном кабинете.
        </p>
        <div className={styles.authPromptActions}>
          <Button variant='secondary' onClick={onLoginRedirect}>
            Войти
          </Button>
          <Button variant='primary' onClick={onRegisterRedirect}>
            Зарегистрироваться
          </Button>
        </div>
      </div>
    </Modal>
    <Modal isOpen={isSuccessModalOpen} onClose={onCloseSuccessModal}>
      <div className={styles.exchangeModal}>
        <div className={styles.modalIcon}>
          <NotificationIcon />
        </div>
        <Title tag='h3' variant='lg'>
          Обмен предложен
        </Title>
        <p>Теперь дождитесь подтверждения. Вам придёт уведомление.</p>
        <Button variant='primary' onClick={onCloseSuccessModal}>
          Готово
        </Button>
      </div>
    </Modal>
  </>
);
