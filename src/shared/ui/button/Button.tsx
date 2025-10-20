import React from 'react';
import type { ButtonProps } from './types.ts';
import styles from './button.module.css';
import clsx from 'clsx';

export const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { children, leftIcon, rightIcon, variant, className, ...rest } = props;

  const buttonClass = clsx(
    styles.button,
    styles[variant],
    { [styles.disabled]: rest.disabled },
    className
  );

  return (
    <button
      type={rest.type}
      className={buttonClass}
      onClick={rest.onClick}
      disabled={rest.disabled}
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

