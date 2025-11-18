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

export const sanitizeUser = (user: PrismaUser | null): SanitizedUser | null => {
  if (!user) {
    return null;
  }

  const { passwordHash: _passwordHash, teachableSkills, learningSkills, ...rest } = user;

  return {
    ...rest,
    role: isUserRole(user.role) ? user.role : 'user',
    teachableSkills: parseSkillList(teachableSkills),
    learningSkills: parseSkillList(learningSkills),
  };
};

export const userService = {
  async listUsers(): Promise<SanitizedUser[]> {
    const users = await userRepository.findAll();
    return users
      .map((user) => sanitizeUser(user))
      .filter((user): user is SanitizedUser => Boolean(user));
  },
};
