import {
  formatBirthDate,
  normalizeGenderInput,
  toISODate,
} from '../profilePersonalData.helpers';

describe('ProfilePersonalData helpers', () => {
  describe('formatBirthDate', () => {
    it('returns empty string for falsy inputs', () => {
      expect(formatBirthDate('')).toBe('');
      expect(formatBirthDate(null)).toBe('');
      expect(formatBirthDate(undefined)).toBe('');
    });

    it('returns original string when date is invalid', () => {
      expect(formatBirthDate('invalid-date')).toBe('invalid-date');
    });

    it('formats valid ISO dates to DD.MM.YYYY', () => {
      expect(formatBirthDate('2024-02-10T00:00:00.000Z')).toBe('10.02.2024');
    });
  });

  describe('toISODate', () => {
    it('returns original string when parsing fails', () => {
      expect(toISODate('10.2024')).toBe('10.2024');
      expect(toISODate('abc')).toBe('abc');
    });

    it('converts DD.MM.YYYY to ISO string', () => {
      const input = '05.03.2020';
      expect(toISODate(input)).toBe(new Date(2020, 2, 5).toISOString());
    });

    it('supports multiple separators', () => {
      const input = '05/04/2023';
      expect(toISODate(input)).toBe(new Date(2023, 3, 5).toISOString());
    });
  });

  describe('normalizeGenderInput', () => {
    it('returns null for blank input', () => {
      expect(normalizeGenderInput('')).toBeNull();
      expect(normalizeGenderInput('   ')).toBeNull();
    });

    it('normalizes known values regardless of case', () => {
      expect(normalizeGenderInput('мужской')).toBe('Мужской');
      expect(normalizeGenderInput('ЖЕНСКИЙ')).toBe('Женский');
    });

    it('returns null when value is not supported', () => {
      expect(normalizeGenderInput('Другое')).toBeNull();
    });
  });
});
