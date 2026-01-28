import { formatDateTime, getRoleLabel, parseSkillMeta } from '../ProfileExchanges';

describe('ProfileExchanges helpers', () => {
  describe('formatDateTime', () => {
    it('returns placeholder for missing or invalid date', () => {
      expect(formatDateTime()).toBe('—');
      expect(formatDateTime('invalid-date')).toBe('—');
    });

    it('delegates to Date#toLocaleString for valid values', () => {
      const spy = jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('05 янв., 12:30');
      const result = formatDateTime('2024-01-05T12:30:00.000Z');

      expect(result).toBe('05 янв., 12:30');
      expect(spy).toHaveBeenCalledWith('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });

      spy.mockRestore();
    });
  });

  describe('parseSkillMeta', () => {
    const titles = new Map<number, string>([
      [10, 'Игра на гитаре'],
      [20, 'Frontend'],
    ]);

    it('returns fallback when skill id is malformed', () => {
      expect(parseSkillMeta('invalid', titles).title).toBe('Неизвестный навык');
    });

    it('returns known title when map has entry', () => {
      expect(parseSkillMeta('123-teach-10-skill', titles).title).toBe('Игра на гитаре');
    });

    it('returns fallback with id when title is missing', () => {
      expect(parseSkillMeta('123-teach-99-skill', titles).title).toBe('Неизвестный навык #99');
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

