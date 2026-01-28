export type CatalogSkillType = 'teach' | 'learn';

export interface CatalogSkillIdParts {
  userId: string;
  type: CatalogSkillType | null;
  subskillId: number | null;
  userSkillId?: string;
}

export const parseCatalogSkillId = (
  skillId: string
): CatalogSkillIdParts | null => {
  if (!skillId) {
    return null;
  }

  const segments = skillId.split('-');
  if (segments.length < 3) {
    return null;
  }

  const hasUserSkillId = segments.length >= 4;
  const userSkillId = hasUserSkillId
    ? segments[segments.length - 1]
    : undefined;
  const subskillIdRaw = segments[segments.length - (hasUserSkillId ? 2 : 1)];
  const typeIndex = segments.length - (hasUserSkillId ? 3 : 2);
  const typeRaw = segments[typeIndex];
  const type = typeRaw === 'teach' || typeRaw === 'learn' ? typeRaw : null;
  const subskillId = Number(subskillIdRaw);
  const userId = segments.slice(0, typeIndex).join('-');

  return {
    userId,
    type,
    subskillId: Number.isFinite(subskillId) ? subskillId : null,
    userSkillId
  };
};
