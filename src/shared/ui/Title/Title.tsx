import type { FC } from 'react';
import clsx from 'clsx';
import './Title.css';
import '../../../app/styles/index.css';
import type { TitleProps } from './types';

export const Title: FC<TitleProps> = ({
  tag = 'h1',
  variant,
  children,
  className,
}) => {
  const Tag = tag;

  const titleClasses = clsx('title', `title--${variant}`, className);

  return <Tag className={titleClasses}>{children}</Tag>;
};
