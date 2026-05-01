import type { ReactElement } from 'react';
import styles from './profileReceivedReviews.module.scss';
import type { UseUserRatingsResult } from '@/entities/User/model/useUserRatings';
import {
  formatAverageRating,
  formatReviewDate,
  formatReviewsCount
} from '@/shared/lib/ratings';

interface ProfileReceivedReviewsProps {
  ratingsState: UseUserRatingsResult;
}

export function ProfileReceivedReviews({
  ratingsState
}: ProfileReceivedReviewsProps): ReactElement {
  const { ratings, averageRating, ratingsCount, isLoading, error } =
    ratingsState;

  const hasRatings = ratingsCount > 0 && averageRating !== null;

  return (
    <section className={styles.reviews} aria-labelledby='profile-reviews-title'>
      <div className={styles.header}>
        <div>
          <h3 id='profile-reviews-title'>Мои отзывы</h3>
          <p>
            Здесь собраны оценки, которые вам оставили после завершённых
            обменов.
          </p>
        </div>

        {!isLoading && !error && hasRatings && (
          <div className={styles.summary} aria-label='Мой средний рейтинг'>
            <span className={styles.average}>
              {formatAverageRating(averageRating)}
            </span>
            <span>{formatReviewsCount(ratingsCount)}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className={styles.state}>Загрузка отзывов...</p>
      ) : error ? (
        <p className={styles.stateError}>Не удалось загрузить отзывы</p>
      ) : ratings.length === 0 ? (
        <p className={styles.state}>У вас пока нет отзывов</p>
      ) : (
        <div className={styles.list}>
          {ratings.map((rating) => (
            <article key={rating.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.author}>{rating.rater.name}</span>
                <span className={styles.score}>Оценка: {rating.score}</span>
              </div>
              <span className={styles.date}>
                {formatReviewDate(rating.createdAt)}
              </span>
              {rating.comment ? (
                <p className={styles.comment}>{rating.comment}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
