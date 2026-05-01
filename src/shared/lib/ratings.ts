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
