import type { CityOption, Filters, SkillCategories } from '../types';
import {
  collectSkillIds,
  countActiveFilters,
  mapCityIdsToCityNames,
  mapCityNamesToCityIds,
  selectedSkillsByGroup,
} from '../utils';

const cityOptions: CityOption[] = [
  { id: 1, name: 'Москва' },
  { id: 2, name: 'Санкт-Петербург' },
  { id: 3, name: 'Воронеж' },
];

const skillGroups: SkillCategories[] = [
  {
    id: 10,
    name: 'Дизайн',
    skills: [
      { id: 101, name: 'UI' },
      { id: 102, name: 'UX' },
    ],
  },
  {
    id: 20,
    name: 'Разработка',
    skills: [
      { id: 201, name: 'Frontend' },
      { id: 202, name: 'Backend' },
    ],
  },
];

describe('Filter utils', () => {
  describe('countActiveFilters', () => {
    const baseFilters: Filters = {
      mode: 'all',
      gender: undefined,
      cities: [],
      skillIds: [],
    };

    it('returns 0 when filters are untouched', () => {
      expect(countActiveFilters(baseFilters)).toBe(0);
    });

    it('counts mode, gender, cities and skills separately', () => {
      const filters: Filters = {
        mode: 'wantToLearn',
        gender: 'female',
        cities: ['Moscow', 'Voronezh'],
        skillIds: [101, 202, 203],
      };

      expect(countActiveFilters(filters)).toBe(1 + 1 + 2 + 3);
    });
  });

  describe('city helpers', () => {
    it('returns names for ids that exist in city options', () => {
      expect(mapCityIdsToCityNames(cityOptions, [3, 1])).toEqual(['Москва', 'Воронеж']);
    });

    it('returns ids for names that exist in city options', () => {
      expect(mapCityNamesToCityIds(cityOptions, ['Санкт-Петербург', 'Москва'])).toEqual([1, 2]);
    });
  });

  describe('skill helpers', () => {
    it('selects only skills belonging to a given group', () => {
      expect(selectedSkillsByGroup(skillGroups[0], [101, 999, 202])).toEqual([101]);
    });

    it('preserves selections from other categories when collecting new ids', () => {
      const selectedSkillIds = [101, 202];
      const categoryId = skillGroups[0].id;
      const newSelection = [102];

      const result = collectSkillIds(skillGroups, selectedSkillIds, categoryId, newSelection);

      expect(result).toEqual([202, 102]);
    });
  });
});
