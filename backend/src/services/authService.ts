import crypto from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createConflict, createUnauthorized } from '../utils/httpErrors.js';
import { tokenService } from './tokenService.js';
import { userRepository } from '../repositories/userRepository.js';
import { sanitizeUser } from './userService.js';
import {
  normalizeUserSkillList,
  type UserSkillInput,
  type UserSkill,
} from '../types/userSkill.js';
import { isUserRole, type UserRole } from '../types/userRole.js';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string | undefined;
  cityId?: number | undefined;
  birthDate?: string | undefined;
  gender?: string | undefined;
  bio?: string | undefined;
  teachableSkills?: UserSkillInput[] | undefined;
  learningSkills?: UserSkillInput[] | undefined;
}

interface LoginInput {
  email: string;
  password: string;
}

type UpdateProfileInput = {
  email?: string | undefined;
  name?: string | undefined;
  avatarUrl?: string | null | undefined;
  cityId?: number | null | undefined;
  birthDate?: string | null | undefined;
  gender?: string | null | undefined;
  bio?: string | null | undefined;
  teachableSkills?: UserSkillInput[] | undefined;
  learningSkills?: UserSkillInput[] | undefined;
};

const normalizeSkills = (skills?: UserSkillInput[]): UserSkill[] => {
  const list = normalizeUserSkillList(skills);
  return list.map((skill) => ({
    ...skill,
    title: skill.title.trim(),
    description: skill.description.trim(),
  }));
};

const parseBirthDate = (value?: string) => {
  if (!value) {
    return null;
  }
  // Accept formats like DD.MM.YYYY or ISO strings
  const dotSeparatedMatch = value.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
  if (dotSeparatedMatch) {
    const [, day, month, year] = dotSeparatedMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const resolveUserRole = (value: unknown): UserRole => {
  if (isUserRole(value)) {
    return value;
  }
  return 'user';
};

export const authService = {
  async register({
    email,
    password,
    name,
    avatarUrl,
    cityId,
    birthDate,
    gender,
    bio,
    teachableSkills,
    learningSkills,
  }: RegisterInput) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw createConflict('User with this email already exists');
    }

    const passwordHash = await hashPassword(password);
    const parsedBirthDate = parseBirthDate(birthDate ?? undefined);
    const normalizedTeachableSkills = normalizeSkills(teachableSkills);
    const normalizedLearningSkills = normalizeSkills(learningSkills);
    const userData: Prisma.UserCreateInput = {
      email,
      passwordHash,
      name,
      teachableSkills: JSON.stringify(normalizedTeachableSkills),
      learningSkills: JSON.stringify(normalizedLearningSkills),
    };

    if (typeof avatarUrl === 'string') {
      userData.avatarUrl = avatarUrl;
    }
    if (typeof cityId === 'number') {
      userData.cityId = cityId;
    }
    if (parsedBirthDate) {
      userData.birthDate = parsedBirthDate;
    }
    if (typeof gender === 'string') {
      userData.gender = gender;
    }
    if (typeof bio === 'string') {
      userData.bio = bio;
    }

    const user = await userRepository.create(userData);

    const tokens = await authService.issueTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: resolveUserRole(user.role),
    });

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw createUnauthorized('Invalid email or password');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw createUnauthorized('Invalid email or password');
    }

    const tokens = await authService.issueTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: resolveUserRole(user.role),
    });

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  async issueTokens({ id, email, name, role }: { id: string; email: string; name: string; role: UserRole }) {
    const jti = crypto.randomUUID();
    const accessToken = tokenService.createAccessToken({ sub: id, email, name, role });
    const { token: refreshToken, expiresAt } = tokenService.createRefreshToken({ sub: id, tokenId: jti });

    await userRepository.saveRefreshToken(jti, id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  },

  async revokeRefreshToken(token: string) {
    await userRepository.deleteRefreshTokenByToken(token);
  },

  async refreshSession(refreshToken: string) {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    // Ensure token exists in DB (may be revoked)
    const { sub: userId } = payload;
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createUnauthorized();
    }

    const existingToken = await userRepository.findRefreshToken(payload.tokenId);
    if (!existingToken || existingToken.token !== refreshToken) {
      throw createUnauthorized();
    }

    // Remove used refresh token to prevent reuse
    await userRepository.deleteRefreshTokenById(payload.tokenId);

    const tokens = await authService.issueTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: resolveUserRole(user.role),
    });

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  async updateProfile(userId: string, updates: UpdateProfileInput) {
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw createUnauthorized();
    }

    if (updates.email && updates.email !== existingUser.email) {
      const conflict = await userRepository.findByEmail(updates.email);
      if (conflict) {
        throw createConflict('User with this email already exists');
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (updates.email) {
      data.email = updates.email;
    }
    if (updates.name) {
      data.name = updates.name;
    }
    if ('avatarUrl' in updates) {
      data.avatarUrl = updates.avatarUrl ?? '';
    }
    if ('cityId' in updates) {
      data.cityId = updates.cityId ?? null;
    }
    if ('birthDate' in updates) {
      if (updates.birthDate) {
        const parsed = parseBirthDate(updates.birthDate);
        data.birthDate = parsed ?? null;
      } else {
        data.birthDate = null;
      }
    }
    if ('gender' in updates) {
      data.gender = updates.gender ?? null;
    }
    if ('bio' in updates) {
      data.bio = updates.bio ?? null;
    }
    if ('teachableSkills' in updates) {
      data.teachableSkills = JSON.stringify(normalizeSkills(updates.teachableSkills));
    }
    if ('learningSkills' in updates) {
      data.learningSkills = JSON.stringify(normalizeSkills(updates.learningSkills));
    }

    if (Object.keys(data).length === 0) {
      return sanitizeUser(existingUser);
    }

    const updated = await userRepository.updateById(userId, data);
    return sanitizeUser(updated);
  },
};
