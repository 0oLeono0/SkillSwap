import crypto from 'node:crypto';
import { jest } from '@jest/globals';
import {
  normalizeUserSkill,
  normalizeUserSkillList,
  type UserSkillInput,
} from '../src/types/userSkill';

describe('normalizeUserSkill utilities', () => {
  const randomUuidSpy = jest.spyOn(crypto, 'randomUUID').mockImplementation(() => 'generated-id');

  afterEach(() => {
    randomUuidSpy.mockClear();
  });

  afterAll(() => {
    randomUuidSpy.mockRestore();
  });

  it('creates a normalized object from numeric input', () => {
    const result = normalizeUserSkill(42);

    expect(result).toEqual({
      id: 'generated-id',
      title: '',
      categoryId: null,
      subcategoryId: 42,
      description: '',
      imageUrls: [],
    });
  });

  it('gracefully handles invalid numbers when input is numeric', () => {
    const result = normalizeUserSkill(Number.NaN);
    expect(result.subcategoryId).toBeNull();
  });

  it('trims values and falls back to generated id for object input', () => {
    const input: UserSkillInput = {
      title: '  JS ',
      description: '  React ',
      id: ' ',
      categoryId: 5,
      subcategoryId: 6,
      imageUrls: ['  https://img ', '   ', null],
    };

    const result = normalizeUserSkill(input);

    expect(result).toEqual({
      id: 'generated-id',
      title: 'JS',
      description: 'React',
      categoryId: 5,
      subcategoryId: 6,
      imageUrls: ['https://img'],
    });
  });

  it('normalizes arrays by delegating to normalizeUserSkill', () => {
    const result = normalizeUserSkillList([1, { title: ' Dev ', id: 'custom' }]);

    expect(result).toHaveLength(2);
    expect(result[0].subcategoryId).toBe(1);
    expect(result[1]).toMatchObject({ id: 'custom', title: 'Dev' });
  });

  it('returns empty array for non-array inputs', () => {
    expect(normalizeUserSkillList(undefined)).toEqual([]);
    expect(normalizeUserSkillList(null)).toEqual([]);
  });
});
