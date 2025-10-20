import type { FC } from 'react';
import styles from './ToggleMote.module.css';
import OpenedIcon from '@/shared/assets/icons/navigation/chevron.svg?react';

interface ToggleMoreProps {
  isOpen: boolean;
  onToggle: () => void;
  labelOpen?: string;
  labelClosed?: string;
}

export const ToggleMore: FC<ToggleMoreProps> = ({
                                                  isOpen,
                                                  onToggle,
                                                  labelOpen = 'Свернуть',
                                                  labelClosed
                                                }) => {
  return (
    <span className={styles.more} onClick={onToggle}>
      {isOpen ? (
        <>
          {labelOpen} <OpenedIcon className={styles.iconOpen} />
        </>
      ) : (
        <>
          {labelClosed} <OpenedIcon className={styles.icon} />
        </>
      )}
    </span>
  );
};