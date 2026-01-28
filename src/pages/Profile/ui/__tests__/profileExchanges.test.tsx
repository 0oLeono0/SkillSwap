import {
  formatDateTime,
  getRoleLabel,
  parseSkillMeta
} from '../ProfileExchanges';

describe('ProfileExchanges helpers', () => {
  describe('formatDateTime', () => {
    it('returns placeholder for missing or invalid date', () => {
      expect(formatDateTime()).toBe('—');
      expect(formatDateTime('invalid-date')).toBe('—');
    });

    it('delegates to Date#toLocaleString for valid values', () => {
      const spy = jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockReturnValue('05 янв., 12:30');
      const result = formatDateTime('2024-01-05T12:30:00.000Z');

      expect(result).toBe('05 янв., 12:30');
      expect(spy).toHaveBeenCalledWith('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      spy.mockRestore();
    });
  });

  describe('parseSkillMeta', () => {
    const titles = new Map<number, string>([
      [10, 'Игра на гитаре'],
      [20, 'Frontend']
    ]);

    it('returns fallback when skill is missing', () => {
      expect(parseSkillMeta(undefined, titles).title).toBe('Неизвестный навык');
    });

    it('returns explicit title when provided', () => {
      expect(
        parseSkillMeta(
          {
            id: 'skill-1',
            title: 'Custom title',
            type: 'teach',
            subcategoryId: 10,
            categoryId: 1
          },
          titles
        ).title
      ).toBe('Custom title');
    });

    it('returns known title when map has entry', () => {
      expect(
        parseSkillMeta(
          {
            id: 'skill-2',
            title: '',
            type: 'teach',
            subcategoryId: 10,
            categoryId: 1
          },
          titles
        ).title
      ).toBe('Игра на гитаре');
    });

    it('returns fallback with id when title is missing', () => {
      expect(
        parseSkillMeta(
          {
            id: 'skill-3',
            title: '',
            type: 'teach',
            subcategoryId: 99,
            categoryId: 1
          },
          titles
        ).title
      ).toBe('Неизвестный навык #99');
    });
  });

  describe('getRoleLabel', () => {
    it('describes initiator role', () => {
      expect(getRoleLabel(true)).toBe('Вы инициировали обмен');
    });

    it('describes participant role', () => {
      expect(getRoleLabel(false)).toBe('Вы присоединились к обмену');
    });
  });
});
