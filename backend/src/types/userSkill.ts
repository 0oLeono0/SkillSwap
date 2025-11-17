import crypto from 'node:crypto';

export interface RawUserSkill {
  id?: string | null;
  title?: string | null;
  categoryId?: number | null;
  subcategoryId?: number | null;
  description?: string | null;
  imageUrls?: unknown;
}

export type UserSkillInput = RawUserSkill | number;

export interface UserSkill {
  id: string;
  title: string;
  categoryId: number | null;
  subcategoryId: number | null;
  description: string;
  imageUrls: string[];
}

const generateSkillId = () => crypto.randomUUID();

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value !== 'number') {
    return null;
  }
  return Number.isFinite(value) ? value : null;
};

const toTrimmedString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item): item is string => item.length > 0);
};

export const normalizeUserSkill = (skill: UserSkillInput): UserSkill => {
  if (typeof skill === 'number') {
    return {
      id: generateSkillId(),
      title: '',
      categoryId: null,
      subcategoryId: Number.isFinite(skill) ? skill : null,
      description: '',
      imageUrls: [],
    };
  }

  const id =
    typeof skill.id === 'string' && skill.id.trim().length > 0
      ? skill.id
      : generateSkillId();

  return {
    id,
    title: toTrimmedString(skill.title),
    categoryId: toNumberOrNull(skill.categoryId),
    subcategoryId: toNumberOrNull(skill.subcategoryId),
    description: toTrimmedString(skill.description),
    imageUrls: toStringArray(skill.imageUrls),
  };
};

export const normalizeUserSkillList = (
  skills?: unknown,
): UserSkill[] => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills.map((skill) => normalizeUserSkill(skill as UserSkillInput));
};
