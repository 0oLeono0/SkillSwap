import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role='dialog' aria-modal='true' onClick={onClose}>
      <div
        className={clsx(styles.modal, className)}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type='button'
          className={styles.closeButton}
          onClick={onClose}
          aria-label='Закрыть'
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};
