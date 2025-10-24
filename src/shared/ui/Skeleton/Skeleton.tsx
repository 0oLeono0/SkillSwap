import type { CSSProperties, FC } from 'react';
import './Skeleton.css';

export type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
};

export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height = '100%',
  borderRadius,
  className,
  style,
}) => (
  <div
    className={`skeleton ${className ?? ''}`.trim()}
    style={{ width, height, borderRadius, ...style }}
  />
);
