import crypto from 'node:crypto';
import { userRepository } from '../repositories/userRepository.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createConflict, createUnauthorized } from '../utils/httpErrors.js';
import { tokenService } from './tokenService.js';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
  cityId?: number;
  birthDate?: string;
  gender?: string;
  bio?: string;
  teachableSkills?: number[];
  learningSkills?: number[];
}

interface LoginInput {
  email: string;
  password: string;
}

const parseSkillList = (value?: string | null): number[] => {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => Number(item))
      .filter((item): item is number => Number.isFinite(item));
  } catch {
    return [];
  }
};

const sanitizeUser = (user: Awaited<ReturnType<typeof userRepository.findById>>) => {
  if (!user) return null;
  const { passwordHash, teachableSkills, learningSkills, ...rest } = user;
  return {
    ...rest,
    teachableSkills: parseSkillList(teachableSkills),
    learningSkills: parseSkillList(learningSkills),
  };
};

const normalizeSkills = (skills?: number[]) =>
  Array.isArray(skills) ? skills.filter((skill) => Number.isInteger(skill)) : [];

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
    const user = await userRepository.create({
      email,
      passwordHash,
      name,
      avatarUrl,
      cityId,
      birthDate: parsedBirthDate ?? undefined,
      gender,
      bio,
      teachableSkills: JSON.stringify(normalizedTeachableSkills),
      learningSkills: JSON.stringify(normalizedLearningSkills),
    });

    const tokens = await authService.issueTokens(user.id, user.email, user.name);

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

    const tokens = await authService.issueTokens(user.id, user.email, user.name);

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  async issueTokens(userId: string, email: string, name: string) {
    const jti = crypto.randomUUID();
    const accessToken = tokenService.createAccessToken({ sub: userId, email, name });
    const { token: refreshToken, expiresAt } = tokenService.createRefreshToken({ sub: userId, tokenId: jti });

    await userRepository.saveRefreshToken(jti, userId, refreshToken, expiresAt);

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

    const tokens = await authService.issueTokens(user.id, user.email, user.name);

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },
};
