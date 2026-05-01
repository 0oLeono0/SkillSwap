import {
  formatAverageRating,
  formatReviewDate,
  formatReviewsCount
} from './ratings';

describe('ratings helpers', () => {
  describe('formatAverageRating', () => {
    it('formats average rating with one decimal place', () => {
      expect(formatAverageRating(4)).toBe('4.0');
      expect(formatAverageRating(4.75)).toBe('4.8');
    });
  });

  describe('formatReviewsCount', () => {
    it.each([
      [0, '0 отзывов'],
      [1, '1 отзыв'],
      [2, '2 отзыва'],
      [5, '5 отзывов'],
      [11, '11 отзывов'],
      [21, '21 отзыв'],
      [22, '22 отзыва'],
      [25, '25 отзывов']
    ])('formats %i as "%s"', (count, expected) => {
      expect(formatReviewsCount(count)).toBe(expected);
    });
  });

  describe('formatReviewDate', () => {
    it('returns placeholder for missing or invalid date', () => {
      expect(formatReviewDate(null)).toBe('Дата не указана');
      expect(formatReviewDate(undefined)).toBe('Дата не указана');
      expect(formatReviewDate('not-a-date')).toBe('Дата не указана');
    });

    it('delegates valid dates to Date#toLocaleDateString', () => {
      const spy = jest
        .spyOn(Date.prototype, 'toLocaleDateString')
        .mockReturnValue('30 апр. 2026 г.');

      try {
        expect(formatReviewDate('2026-04-30T10:00:00.000Z')).toBe(
          '30 апр. 2026 г.'
        );
        expect(spy).toHaveBeenCalledWith('ru-RU', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } finally {
        spy.mockRestore();
      }
    });
  });
});
