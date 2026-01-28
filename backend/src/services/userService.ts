import type {
  User as PrismaUser,
  UserSkill as PrismaUserSkill
} from '@prisma/client';
import { userRepository } from '../repositories/userRepository.js';
import { parseImageUrls, type UserSkill } from '../types/userSkill.js';
import { isUserRole, type UserRole, USER_ROLE } from '../types/userRole.js';
import { USER_SKILL_TYPE } from '../types/userSkillType.js';

type UserRecord = PrismaUser & { userSkills?: PrismaUserSkill[] | null };

const mapSkillRecord = (record: PrismaUserSkill): UserSkill => ({
  id: record.id,
  title: record.title?.trim() ?? '',
  categoryId: typeof record.categoryId === 'number' ? record.categoryId : null,
  subcategoryId:
    typeof record.subcategoryId === 'number' ? record.subcategoryId : null,
  description: record.description?.trim() ?? '',
  imageUrls: parseImageUrls(record.imageUrls)
});

export type SanitizedUser = Omit<PrismaUser, 'passwordHash' | 'role'> & {
  role: UserRole;
  teachableSkills: UserSkill[];
  learningSkills: UserSkill[];
};

export type PublicUser = Omit<SanitizedUser, 'email'>;

export const sanitizeUser = (user: UserRecord | null): SanitizedUser | null => {
  if (!user) {
    return null;
  }

  const { passwordHash: _passwordHash, avatarUrl, userSkills, ...rest } = user;
  const normalizeNullableString = (value?: string | null) =>
    value && value.trim().length > 0 ? value : null;
  const normalizedSkills = Array.isArray(userSkills) ? userSkills : [];
  const teachableSkills: UserSkill[] = [];
  const learningSkills: UserSkill[] = [];

  for (const skill of normalizedSkills) {
    if (skill.type === USER_SKILL_TYPE.learn) {
      learningSkills.push(mapSkillRecord(skill));
    } else {
      teachableSkills.push(mapSkillRecord(skill));
    }
  }

  return {
    ...rest,
    avatarUrl: normalizeNullableString(avatarUrl),
    role: isUserRole(user.role) ? user.role : USER_ROLE.user,
    teachableSkills,
    learningSkills
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
  }
};
