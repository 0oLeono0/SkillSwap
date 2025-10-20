type titleTag = 'h1' | 'h2' | 'h3' | 'h4';
type titleVariant = 'xl' | 'lg' | 'md' | 'sm';

export interface TitleProps {
  tag?: titleTag;
  variant: titleVariant;
  children: React.ReactNode;
  className?: string;
}
