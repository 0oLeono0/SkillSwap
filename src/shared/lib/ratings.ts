export const formatAverageRating = (averageRating: number) =>
  averageRating.toFixed(1);

export const formatReviewsCount = (count: number) => {
  const absCount = Math.abs(count);
  const lastTwoDigits = absCount % 100;
  const lastDigit = absCount % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} отзывов`;
  }
  if (lastDigit === 1) {
    return `${count} отзыв`;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} отзыва`;
  }
  return `${count} отзывов`;
};

export const formatReviewDate = (value?: string | null) => {
  if (!value) {
    return 'Дата не указана';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
