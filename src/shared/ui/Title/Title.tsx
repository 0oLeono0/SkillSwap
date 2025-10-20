import './Title.css';
import type { TitleProps } from './types';
import '../../../app/styles/index.css';
import clsx from 'clsx';

export const Title: React.FC<TitleProps> = ({
  tag = 'h1',
  variant,
  children,
  className
}) => {
  const Tag = tag;

  const titleClasses = clsx('title', `title--${variant}`, className);

  return <Tag className={titleClasses}>{children}</Tag>;
};
