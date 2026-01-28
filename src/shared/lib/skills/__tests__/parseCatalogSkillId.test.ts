import { parseCatalogSkillId } from '../parseCatalogSkillId';

describe('parseCatalogSkillId', () => {
  it('returns null for missing or malformed input', () => {
    expect(parseCatalogSkillId('')).toBeNull();
    expect(parseCatalogSkillId('one-two')).toBeNull();
  });

  it('parses ids with userSkillId suffix', () => {
    const parsed = parseCatalogSkillId('user-123-teach-10-skill123');
    expect(parsed).toEqual({
      userId: 'user-123',
      type: 'teach',
      subskillId: 10,
      userSkillId: 'skill123'
    });
  });

  it('parses legacy ids without userSkillId', () => {
    const parsed = parseCatalogSkillId('user-learn-20');
    expect(parsed).toEqual({
      userId: 'user',
      type: 'learn',
      subskillId: 20,
      userSkillId: undefined
    });
  });
});
