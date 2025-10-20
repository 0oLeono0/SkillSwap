import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonIconProps = {
  icon?: ReactNode;
  show?: boolean;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  leftIcon?: ButtonIconProps;
  rightIcon?: ButtonIconProps;
  variant: 'primary' | 'secondary' | 'tertiary' | 'empty';
  className?: string
};