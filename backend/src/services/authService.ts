import crypto from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createConflict, createUnauthorized } from '../utils/httpErrors.js';
import { tokenService } from './tokenService.js';
import { userRepository } from '../repositories/userRepository.js';
import { userSkillRepository } from '../repositories/userSkillRepository.js';
import { prisma } from '../lib/prisma.js';
import { sanitizeUser } from './userService.js';
import {
  normalizeUserSkillList,
  type UserSkillInput,
  type UserSkill,
  serializeImageUrls
} from '../types/userSkill.js';
import { isUserRole, type UserRole, USER_ROLE } from '../types/userRole.js';
import { USER_SKILL_TYPE, type UserSkillType } from '../types/userSkillType.js';
import { hashToken } from '../utils/tokenHash.js';

type DbClient = PrismaClient | Prisma.TransactionClient;

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
    description: skill.description.trim()
  }));
};

const toSkillCreateInput = (
  userId: string,
  type: UserSkillType,
  skill: UserSkill
): Prisma.UserSkillCreateManyInput => ({
  id: skill.id,
  userId,
  type,
  title: skill.title.trim(),
  description: skill.description.trim(),
  categoryId: skill.categoryId ?? null,
  subcategoryId: skill.subcategoryId ?? null,
  imageUrls: serializeImageUrls(skill.imageUrls)
});

const toSkillUpdateInput = (
  skill: UserSkill
): Prisma.UserSkillUncheckedUpdateInput => ({
  title: skill.title.trim(),
  description: skill.description.trim(),
  categoryId: skill.categoryId ?? null,
  subcategoryId: skill.subcategoryId ?? null,
  imageUrls: serializeImageUrls(skill.imageUrls)
});

const syncUserSkills = async (
  userId: string,
  type: UserSkillType,
  input: UserSkillInput[] | undefined,
  client: DbClient
) => {
  const normalized = normalizeSkills(input);
  const existing = await userSkillRepository.findByUserAndType(
    userId,
    type,
    client
  );
  const existingById = new Map(existing.map((skill) => [skill.id, skill]));
  const incomingIds = new Set(normalized.map((skill) => skill.id));

  const toCreate = normalized.filter((skill) => !existingById.has(skill.id));
  const toUpdate = normalized.filter((skill) => existingById.has(skill.id));
  const toDeleteIds = existing
    .filter((skill) => !incomingIds.has(skill.id))
    .map((skill) => skill.id);

  if (toDeleteIds.length > 0) {
    await userSkillRepository.deleteByIds(toDeleteIds, client);
  }

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((skill) =>
        userSkillRepository.updateById(
          skill.id,
          toSkillUpdateInput(skill),
          client
        )
      )
    );
  }

  const createRows = toCreate.map((skill) =>
    toSkillCreateInput(userId, type, skill)
  );
  await userSkillRepository.createMany(createRows, client);
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
  return USER_ROLE.user;
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
    learningSkills
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
      name
    };

    if (typeof avatarUrl === 'string') {
      userData.avatarUrl = avatarUrl;
    }
    if (typeof cityId === 'number') {
      userData.city = { connect: { id: cityId } };
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

    const { user: userWithSkills, tokens } = await prisma.$transaction(
      async (tx) => {
        const user = await userRepository.create(userData, tx);

        const skillRows = [
          ...normalizedTeachableSkills.map((skill) =>
            toSkillCreateInput(user.id, USER_SKILL_TYPE.teach, skill)
          ),
          ...normalizedLearningSkills.map((skill) =>
            toSkillCreateInput(user.id, USER_SKILL_TYPE.learn, skill)
          )
        ];

        await userSkillRepository.createMany(skillRows, tx);

        const userWithSkills = await userRepository.findById(user.id, tx);
        if (!userWithSkills) {
          throw createUnauthorized();
        }

        const tokens = await authService.issueTokens(
          {
            id: user.id,
            email: user.email,
            name: user.name,
            role: resolveUserRole(user.role)
          },
          tx
        );

        return { user: userWithSkills, tokens };
      }
    );

    return {
      user: sanitizeUser(userWithSkills),
      ...tokens
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
      role: resolveUserRole(user.role)
    });

    return {
      user: sanitizeUser(user),
      ...tokens
    };
  },

  async issueTokens(
    {
      id,
      email,
      name,
      role
    }: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    },
    client?: DbClient
  ) {
    const jti = crypto.randomUUID();
    const accessToken = tokenService.createAccessToken({
      sub: id,
      email,
      name,
      role
    });
    const { token: refreshToken, expiresAt } = tokenService.createRefreshToken({
      sub: id,
      tokenId: jti
    });

    const refreshTokenHash = hashToken(refreshToken);
    await userRepository.saveRefreshToken(
      jti,
      id,
      refreshTokenHash,
      expiresAt,
      client
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: expiresAt
    };
  },

  async revokeRefreshToken(token: string) {
    await userRepository.deleteRefreshTokenByToken(token);
  },

  async refreshSession(refreshToken: string) {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    const { sub: userId } = payload;
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createUnauthorized();
    }

    const providedTokenHash = hashToken(refreshToken);
    const now = new Date();
    const deleted = await userRepository.deleteRefreshTokenIfValid(
      payload.tokenId,
      providedTokenHash,
      refreshToken,
      now
    );

    if (deleted.count === 0) {
      await userRepository.deleteRefreshTokenIfExpired(
        payload.tokenId,
        providedTokenHash,
        refreshToken,
        now
      );
      throw createUnauthorized();
    }

    const tokens = await authService.issueTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: resolveUserRole(user.role)
    });

    return {
      user: sanitizeUser(user),
      ...tokens
    };
  },

  async updateProfile(userId: string, updates: UpdateProfileInput) {
    const shouldUpdateSkills =
      'teachableSkills' in updates || 'learningSkills' in updates;

    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await userRepository.findById(userId, tx);
      if (!existingUser) {
        throw createUnauthorized();
      }

      if (updates.email && updates.email !== existingUser.email) {
        const conflict = await userRepository.findByEmail(updates.email, tx);
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
        data.avatarUrl = updates.avatarUrl ?? null;
      }
      if ('cityId' in updates) {
        if (typeof updates.cityId === 'number') {
          data.city = { connect: { id: updates.cityId } };
        } else {
          data.city = { disconnect: true };
        }
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

      let updatedUser = existingUser;
      if (Object.keys(data).length > 0) {
        updatedUser = await userRepository.updateById(userId, data, tx);
      }

      if ('teachableSkills' in updates) {
        await syncUserSkills(
          userId,
          USER_SKILL_TYPE.teach,
          updates.teachableSkills,
          tx
        );
      }

      if ('learningSkills' in updates) {
        await syncUserSkills(
          userId,
          USER_SKILL_TYPE.learn,
          updates.learningSkills,
          tx
        );
      }

      if (shouldUpdateSkills) {
        const userWithSkills = await userRepository.findById(userId, tx);
        if (!userWithSkills) {
          throw createUnauthorized();
        }
        return userWithSkills;
      }

      return updatedUser;
    });

    return sanitizeUser(user);
  }
};
