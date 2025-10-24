import type { ReactNode } from 'react';

type TitleTag = 'h1' | 'h2' | 'h3' | 'h4';
export type TitleVariant = 'xl' | 'lg' | 'md' | 'sm';

export interface TitleProps {
  tag?: TitleTag;
  variant: TitleVariant;
  children: ReactNode;
  className?: string;
}
