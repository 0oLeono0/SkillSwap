import type { UserSkill } from '@/entities/User/types';
import { sanitizeSkillsForSubmit, serializeSkills } from '../ProfileSkills';

const buildSubskillCategoryMap = () => new Map([[1, 101], [2, 101]]);
const buildSubskillNameMap = () => new Map([[1, 'Гитара'], [2, 'Фортепиано']]);

const createSkill = (overrides: Partial<UserSkill> = {}): UserSkill => ({
  id: overrides.id ?? 'skill-a',
  title: overrides.title ?? 'Название',
  categoryId: overrides.categoryId ?? null,
  subcategoryId:
    overrides.subcategoryId !== undefined ? overrides.subcategoryId : 1,
  description: overrides.description ?? 'Описание',
  imageUrls: overrides.imageUrls ?? [],
});

describe('ProfileSkills helpers', () => {
  describe('sanitizeSkillsForSubmit', () => {
    it('trims fields, resolves fallbacks and removes blank URLs', () => {
      const input: UserSkill = createSkill({
        id: 'skill-1',
        title: '  ',
        description: '   ',
        categoryId: null,
        subcategoryId: 1,
        imageUrls: [' https://image ', '   ', ''],
      });
      const [result] = sanitizeSkillsForSubmit(
        [input],
        buildSubskillCategoryMap(),
        buildSubskillNameMap(),
      );

      expect(result).toEqual({
        id: 'skill-1',
        title: 'Гитара',
        categoryId: 101,
        subcategoryId: 1,
        description: expect.any(String),
        imageUrls: ['https://image'],
      });
      expect(result.description.length).toBeGreaterThan(0);
    });

    it('keeps provided title/description when valid and clears missing category data', () => {
      const input: UserSkill = createSkill({
        title: '  Custom ',
        description: '  Detailed ',
        subcategoryId: null,
      });
      const [result] = sanitizeSkillsForSubmit(
        [input],
        buildSubskillCategoryMap(),
        buildSubskillNameMap(),
      );

      expect(result.title).toBe('Custom');
      expect(result.description).toBe('Detailed');
      expect(result.categoryId).toBeNull();
      expect(result.subcategoryId).toBeNull();
    });
  });

  describe('serializeSkills', () => {
    it('returns stable JSON sorted by id', () => {
      const skillA = createSkill({ id: 'b-skill', title: 'B title' });
      const skillB = createSkill({ id: 'a-skill', title: 'A title' });

      const serialized = serializeSkills(
        [skillA, skillB],
        buildSubskillCategoryMap(),
        buildSubskillNameMap(),
      );
      const parsed = JSON.parse(serialized);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('a-skill');
      expect(parsed[1].id).toBe('b-skill');
    });
  });
});
