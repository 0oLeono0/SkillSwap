import type { FC } from 'react';
import clsx from 'clsx';
import styles from './button.module.css';
import type { ButtonProps } from './types';

export const Button: FC<ButtonProps> = ({
  children,
  leftIcon,
  rightIcon,
  variant,
  className,
  onClick,
  type = 'button',
  disabled,
  ...rest
}) => {
  const buttonClass = clsx(
    styles.button,
    styles[variant],
    { [styles.disabled]: disabled },
    className,
  );

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {leftIcon?.show && leftIcon.icon && (
        <span className={styles.icon}>{leftIcon.icon}</span>
      )}
      <span className={styles.title}>{children}</span>
      {rightIcon?.show && rightIcon.icon && (
        <span className={styles.icon}>{rightIcon.icon}</span>
      )}
    </button>
  );
};
