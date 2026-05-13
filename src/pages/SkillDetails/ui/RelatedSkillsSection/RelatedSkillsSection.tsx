import type { ReactElement } from 'react';
import styles from './RelatedSkillsSection.module.scss';
import { Title } from '@/shared/ui/Title';
import { SkillsList } from '@/widgets/SkillsList';
import type { RelatedSkillsSectionProps } from './RelatedSkillsSection.types';

export const RelatedSkillsSection = ({
  authors,
  onToggleFavorite,
  onDetailsClick
}: RelatedSkillsSectionProps): ReactElement => (
  <div className={styles.relatedSection}>
    <div className={styles.relatedHeader}>
      <Title tag='h2' variant='lg'>
        Похожие предложения
      </Title>
    </div>
    {authors.length ? (
      <SkillsList
        authors={authors}
        onToggleFavorite={onToggleFavorite}
        onDetailsClick={onDetailsClick}
      />
    ) : (
      <div className={styles.state}>Пока нет похожих предложений</div>
    )}
  </div>
);
