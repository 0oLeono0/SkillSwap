import { useState, type FC } from 'react';
import IdeaIcon from '../../assets/icons/status/idea.svg?react';
import CrossIcon from '../../assets/icons/actions/cross.svg?react';
import './Toast.css';
import { useToastTimer } from '@/shared/hooks/useToastTimer';

export type ToastProps = {
  message: string;
  isShow: boolean;
  isHide: boolean;
  onAction?: () => void;
  onClose: () => void;
};

export const Toast: FC<ToastProps> = ({
  message,
  isShow,
  isHide,
  onAction,
  onClose,
}) => {
  const [hovered, setHovered] = useState(false);

  useToastTimer(isShow, isHide, hovered, onClose, 5000);

  const visibilityClass = isShow && !isHide ? 'showToast' : 'hiddenToast';

  return (
    <div
      className={`toast ${visibilityClass} absoluteToast`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div aria-hidden="true" className="toastIkon">
        <IdeaIcon />
      </div>
      <div>{message}</div>

      {onAction && (
        <button className="toastButton" onClick={onAction} type="button">
          Показать
        </button>
      )}

      <button
        className="toastCloseButton"
        onClick={onClose}
        type="button"
        aria-label="Закрыть уведомление"
      >
        <span>
          <CrossIcon />
        </span>
      </button>
    </div>
  );
};
