import type { FC } from 'react';
import clsx from 'clsx';
import styles from './tag.module.css';
import { CATEGORY_CLASS_MAP, type TagProps } from './types';

export const Tag: FC<TagProps> = ({ category, className, children }) => (
  <span
    className={clsx(
      styles.tag,
      category && styles[CATEGORY_CLASS_MAP[category]],
      className,
    )}
  >
    {children}
  </span>
);
