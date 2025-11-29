import type { User as PrismaUser } from '@prisma/client';
import { userRepository } from '../repositories/userRepository.js';
import {
  normalizeUserSkillList,
  type UserSkill,
} from '../types/userSkill.js';
import { isUserRole, type UserRole } from '../types/userRole.js';

const parseSkillList = (value?: string | null): UserSkill[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return normalizeUserSkillList(parsed);
  } catch {
    return [];
  }
};

export type SanitizedUser = Omit<
  PrismaUser,
  'passwordHash' | 'teachableSkills' | 'learningSkills' | 'role'
> & {
  role: UserRole;
  teachableSkills: UserSkill[];
  learningSkills: UserSkill[];
};

export type PublicUser = Omit<SanitizedUser, 'email'>;

export const sanitizeUser = (user: PrismaUser | null): SanitizedUser | null => {
  if (!user) {
    return null;
  }

  const { passwordHash: _passwordHash, teachableSkills, learningSkills, avatarUrl, ...rest } = user;
  const normalizeNullableString = (value?: string | null) =>
    value && value.trim().length > 0 ? value : null;

  return {
    ...rest,
    avatarUrl: normalizeNullableString(avatarUrl),
    role: isUserRole(user.role) ? user.role : 'user',
    teachableSkills: parseSkillList(teachableSkills),
    learningSkills: parseSkillList(learningSkills),
  };
};

const toPublicUser = (user: SanitizedUser): PublicUser => {
  const { email: _email, ...rest } = user;
  return rest;
};

export const userService = {
  async listUsers(): Promise<SanitizedUser[]> {
    const users = await userRepository.findAll();
    return users
      .map((user) => sanitizeUser(user))
      .filter((user): user is SanitizedUser => Boolean(user));
  },

  async listPublicUsers(): Promise<PublicUser[]> {
    const users = await userRepository.findAll();
    return users
      .map((user) => sanitizeUser(user))
      .filter((user): user is SanitizedUser => Boolean(user))
      .map(toPublicUser);
  },
};
