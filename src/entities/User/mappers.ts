import type { ApiAuthUser, ApiUserSkill } from '@/shared/api/auth';
import type { ApiCatalogUser } from '@/shared/api/users';
import type { Gender } from '@/shared/types/gender';
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

const ALLOWED_GENDERS = new Set<Gender>([
  '\u041c\u0443\u0436\u0441\u043a\u043e\u0439',
  '\u0416\u0435\u043d\u0441\u043a\u0438\u0439'
]);

const normalizeGender = (value: unknown): Gender | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return ALLOWED_GENDERS.has(trimmed as Gender) ? (trimmed as Gender) : null;
};

const normalizeApiSkill = (entry: ApiUserSkill): UserSkill => {
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
    imageUrls: toStringArray(entry.imageUrls)
  };
};

export const normalizeApiSkillList = (
  skills?: ApiUserSkill[] | null
): UserSkill[] => {
  if (!Array.isArray(skills)) {
    return [];
  }
  return skills.map(normalizeApiSkill);
};

type ApiUserSource = ApiAuthUser | ApiCatalogUser;

export const mapApiToUser = (apiUser: ApiUserSource): User => ({
  id: apiUser.id,
  name: apiUser.name,
  role: apiUser.role,
  avatarUrl: apiUser.avatarUrl ?? null,
  cityId: typeof apiUser.cityId === 'number' ? apiUser.cityId : null,
  birthDate: apiUser.birthDate ?? null,
  gender: normalizeGender(apiUser.gender),
  bio: apiUser.bio ?? null,
  teachableSkills: normalizeApiSkillList(apiUser.teachableSkills),
  learningSkills: normalizeApiSkillList(apiUser.learningSkills)
});
