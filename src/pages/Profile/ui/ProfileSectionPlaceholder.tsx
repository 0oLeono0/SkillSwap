import { Title } from '@/shared/ui/Title';
import styles from './profilePlaceholder.module.scss';

interface ProfileSectionPlaceholderProps {
  title: string;
  description?: string;
}

export function ProfileSectionPlaceholder({
  title,
  description = 'Раздел скоро будет доступен.',
}: ProfileSectionPlaceholderProps) {
  return (
    <div className={styles.placeholder}>
      <Title tag='h2' variant='lg'>
        {title}
      </Title>
      <p>{description}</p>
    </div>
  );
}
