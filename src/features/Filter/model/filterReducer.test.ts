import { filterReducer, filtersInitialState } from './filterReducer';
import type { Filters, SearchMode } from '../types';

const buildState = (overrides: Partial<Filters> = {}): Filters => ({
  ...filtersInitialState,
  ...overrides
});

describe('filterReducer', () => {
  it('sets mode', () => {
    const next = filterReducer(filtersInitialState, {
      type: 'setMode',
      mode: 'canTeach'
    });
    expect(next.mode).toBe<Exclude<SearchMode, 'wantToLearn'>>('canTeach');
  });

  it('sets sort by', () => {
    const next = filterReducer(filtersInitialState, {
      type: 'setSortBy',
      sortBy: 'rating'
    });
    expect(next.sortBy).toBe('rating');
  });

  it('sets activity period', () => {
    const next = filterReducer(filtersInitialState, {
      type: 'setActivityPeriod',
      activityPeriod: 'month'
    });
    expect(next.activityPeriod).toBe('month');
  });

  it('sets gender and cities', () => {
    const withGender = filterReducer(filtersInitialState, {
      type: 'setGender',
      gender: 'female'
    });
    expect(withGender.gender).toBe('female');

    const withCities = filterReducer(withGender, {
      type: 'setCities',
      cities: ['Minsk']
    });
    expect(withCities.cities).toEqual(['Minsk']);
  });

  it('updates skill ids', () => {
    const next = filterReducer(filtersInitialState, {
      type: 'setSkillIds',
      skillIds: [1, 2, 3]
    });
    expect(next.skillIds).toEqual([1, 2, 3]);
  });

  it('replaces filters atomically', () => {
    const replacement: Filters = {
      mode: 'wantToLearn',
      sortBy: 'rating',
      activityPeriod: 'week',
      gender: 'male',
      cities: ['Vilnius'],
      skillIds: [5]
    };

    const next = filterReducer(buildState({ mode: 'all' }), {
      type: 'replace',
      filters: replacement
    });
    expect(next).toEqual(replacement);
  });

  it('resets to initial state', () => {
    const dirty = buildState({
      mode: 'wantToLearn',
      sortBy: 'rating',
      activityPeriod: 'day',
      gender: 'male',
      cities: ['Minsk'],
      skillIds: [1]
    });
    const next = filterReducer(dirty, { type: 'reset' });
    expect(next).toEqual(filtersInitialState);
  });
});
