import type { ReactElement } from 'react';
import styles from './AuthorCard.module.scss';
import type { SkillCategory } from '@/shared/lib/constants';
import { formatAverageRating, formatReviewsCount } from '@/shared/lib/ratings';
import { USER_STATUS_LABELS } from '@/shared/types/userStatus';
import { Tag } from '@/shared/ui/Tag/Tag';
import { Title } from '@/shared/ui/Title';
import type { AuthorCardProps } from './AuthorCard.types';

export const AuthorCard = ({
  authorInfo,
  authorBio,
  authorStatus,
  avatarFallback,
  teachSkills,
  learnSkills,
  selectedSkillId,
  isRatingsLoading,
  ratingsError,
  ratingsCount,
  averageRating,
  onSelectSkill
}: AuthorCardProps): ReactElement => (
  <article className={styles.authorCard}>
    <div className={styles.authorInfo}>
      <img
        className={styles.authorAvatar}
        src={authorInfo.avatarUrl || avatarFallback}
        alt={authorInfo.name}
      />
      <div>
        <Title tag='h2' variant='lg'>
          {authorInfo.name}
        </Title>
        <p className={styles.authorMeta}>
          {authorInfo.city || 'Город не указан'}, {authorInfo.age} лет
        </p>
        <span
          className={
            authorStatus === 'active'
              ? `${styles.authorStatus} ${styles.authorStatusActive}`
              : `${styles.authorStatus} ${styles.authorStatusInactive}`
          }
        >
          {USER_STATUS_LABELS[authorStatus]}
        </span>
      </div>
    </div>
    <div className={styles.authorRating} aria-label='Рейтинг автора'>
      {isRatingsLoading ? (
        <span className={styles.authorRatingStatus}>Загрузка рейтинга...</span>
      ) : ratingsError ? (
        <span className={styles.authorRatingStatus}>Рейтинг недоступен</span>
      ) : ratingsCount > 0 && averageRating !== null ? (
        <>
          <span className={styles.authorRatingValue}>
            {formatAverageRating(averageRating)}
          </span>
          <span className={styles.authorRatingCount}>
            {formatReviewsCount(ratingsCount)}
          </span>
        </>
      ) : (
        <span className={styles.authorRatingStatus}>Нет оценок</span>
      )}
    </div>
    <p className={styles.authorBio}>{authorBio}</p>

    <div className={styles.authorSkills}>
      <span>Может научить:</span>
      <div className={styles.tags}>
        {teachSkills.map((skill) => (
          <button
            key={skill.id}
            type='button'
            className={
              skill.id === selectedSkillId
                ? `${styles.skillTagButton} ${styles.skillTagButtonActive}`
                : styles.skillTagButton
            }
            onClick={() => onSelectSkill(skill.id)}
            aria-pressed={skill.id === selectedSkillId}
          >
            <Tag category={skill.category as SkillCategory}>{skill.title}</Tag>
          </button>
        ))}
      </div>
    </div>

    <div className={styles.authorSkills}>
      <span>Хочет научиться:</span>
      <div className={styles.tags}>
        {learnSkills.map((skill) => (
          <Tag key={skill.id} category={skill.category as SkillCategory}>
            {skill.title}
          </Tag>
        ))}
      </div>
    </div>
  </article>
);
