import type {
  ApiAuthUser,
  ApiUserSkillResponse,
} from '@/shared/api/auth';
import type { User, UserSkill } from './types';

const generateSkillId = () => {
  const cryptoApi = globalThis?.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `skill-${Math.random().toString(36).slice(2, 11)}`;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value !== 'number') {
    return null;
  }
  return Number.isFinite(value) ? value : null;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item): item is string => item.length > 0);
};

const normalizeApiSkill = (entry: ApiUserSkillResponse): UserSkill => {
  if (typeof entry === 'number') {
    return {
      id: generateSkillId(),
      title: '',
      categoryId: null,
      subcategoryId: Number.isFinite(entry) ? entry : null,
      description: '',
      imageUrls: [],
    };
  }

  const id =
    typeof entry.id === 'string' && entry.id.trim().length > 0
      ? entry.id
      : generateSkillId();

  return {
    id,
    title: entry.title?.trim() ?? '',
    categoryId: toNumberOrNull(entry.categoryId),
    subcategoryId: toNumberOrNull(entry.subcategoryId),
    description: entry.description?.trim() ?? '',
    imageUrls: toStringArray(entry.imageUrls),
  };
};

export const normalizeApiSkillList = (
  skills?: ApiUserSkillResponse[] | null,
): UserSkill[] => {
  if (!Array.isArray(skills)) {
    return [];
  }
  return skills.map(normalizeApiSkill);
};

export const mapApiToUser = (apiUser: ApiAuthUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  avatarUrl: apiUser.avatarUrl ?? null,
  cityId: typeof apiUser.cityId === 'number' ? apiUser.cityId : null,
  birthDate: apiUser.birthDate ?? null,
  gender: apiUser.gender ?? null,
  bio: apiUser.bio ?? null,
  teachableSkills: normalizeApiSkillList(apiUser.teachableSkills),
  learningSkills: normalizeApiSkillList(apiUser.learningSkills),
});
