import React from 'react';
import type { TagProps } from './types.ts';
import { CATEGORY_CLASS_MAP } from './types.ts';
import styles from './tag.module.css';
import clsx from 'clsx';

export const Tag: React.FC<TagProps> = (props: TagProps) => {
  const { category, className, children } = props;



  return (
    <span className={clsx(
      styles.tag,
      category && styles[CATEGORY_CLASS_MAP[category]],
      className
    )}>
      {children}
    </span>
  );
};
