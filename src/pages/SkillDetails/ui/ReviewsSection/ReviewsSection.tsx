import type { ReactElement } from 'react';
import styles from './ReviewsSection.module.scss';
import {
  formatAverageRating,
  formatReviewDate,
  formatReviewsCount
} from '@/shared/lib/ratings';
import { Title } from '@/shared/ui/Title';
import type { ReviewsSectionProps } from './ReviewsSection.types';

export const ReviewsSection = ({
  latestRatings,
  isLoading,
  error,
  ratingsCount,
  averageRating
}: ReviewsSectionProps): ReactElement => (
  <section className={styles.reviewsSection}>
    <div className={styles.reviewsHeader}>
      <Title tag='h2' variant='lg'>
        Отзывы
      </Title>
      {!isLoading && !error && ratingsCount > 0 && averageRating !== null && (
        <div
          className={styles.reviewsSummary}
          aria-label='Средний рейтинг автора'
        >
          <span className={styles.reviewsAverage}>
            {formatAverageRating(averageRating)}
          </span>
          <span>{formatReviewsCount(ratingsCount)}</span>
        </div>
      )}
    </div>

    {isLoading ? (
      <div className={styles.state}>Загрузка отзывов...</div>
    ) : error ? (
      <div className={styles.stateError}>Не удалось загрузить отзывы</div>
    ) : latestRatings.length === 0 ? (
      <div className={styles.state}>Пока нет отзывов</div>
    ) : (
      <div className={styles.reviewList}>
        {latestRatings.map((rating) => (
          <article key={rating.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <span className={styles.reviewName}>{rating.rater.name}</span>
              <span className={styles.reviewScore}>Оценка: {rating.score}</span>
            </div>
            <span className={styles.reviewDate}>
              {formatReviewDate(rating.createdAt)}
            </span>
            {rating.comment ? (
              <p className={styles.reviewComment}>{rating.comment}</p>
            ) : null}
          </article>
        ))}
      </div>
    )}
  </section>
);
