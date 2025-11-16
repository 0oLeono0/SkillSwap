import type { ApiAuthUser } from '@/shared/api/auth';
import type { User } from './types';

const normalizeSkills = (skills?: number[] | null) =>
  Array.isArray(skills) ? skills.filter((id): id is number => Number.isFinite(id)) : [];

export const mapApiToUser = (apiUser: ApiAuthUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  avatarUrl: apiUser.avatarUrl ?? null,
  cityId: typeof apiUser.cityId === 'number' ? apiUser.cityId : null,
  birthDate: apiUser.birthDate ?? null,
  gender: apiUser.gender ?? null,
  bio: apiUser.bio ?? null,
  teachableSkills: normalizeSkills(apiUser.teachableSkills),
  learningSkills: normalizeSkills(apiUser.learningSkills),
});
