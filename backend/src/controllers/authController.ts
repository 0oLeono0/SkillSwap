import { z } from 'zod';
import { authService } from '../services/authService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { refreshTtlMs } from '../services/tokenService.js';
import { createBadRequest, createUnauthorized } from '../utils/httpErrors.js';

const skillSchema = z.union([
  z.object({
    id: z.string().min(1).optional(),
    title: z.string().min(2),
    categoryId: z.number().int().positive().nullable(),
    subcategoryId: z.number().int().positive().nullable(),
    description: z.string().min(1),
    imageUrls: z.array(z.string().min(1)).optional(),
  }),
  z.number().int(),
]);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  avatarUrl: z.string().url().optional().nullable(),
  cityId: z.number().int().positive().optional(),
  birthDate: z.string().min(1).optional(),
  gender: z.string().optional(),
  bio: z.string().max(2000).optional(),
  teachableSkills: z.array(skillSchema).optional(),
  learningSkills: z.array(skillSchema).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const profileUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  cityId: z.number().int().positive().optional().nullable(),
  birthDate: z.union([z.string().min(1), z.null()]).optional(),
  gender: z.string().max(255).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  teachableSkills: z.array(skillSchema).optional(),
  learningSkills: z.array(skillSchema).optional(),
});

const REFRESH_COOKIE_NAME = 'refreshToken';

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
};

const cookieOptions = {
  ...baseCookieOptions,
  maxAge: Math.floor(refreshTtlMs / 1000),
};

export const register = asyncHandler(async (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw createBadRequest('Invalid payload', parseResult.error.flatten());
  }

  const { email, password, name, avatarUrl, cityId, birthDate, gender, bio, teachableSkills, learningSkills } =
    parseResult.data;
  const { user, accessToken, refreshToken } = await authService.register({
    email,
    password,
    name,
    avatarUrl: avatarUrl ?? undefined,
    cityId,
    birthDate,
    gender,
    bio,
    teachableSkills,
    learningSkills,
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

  return res.status(201).json({
    user,
    accessToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw createBadRequest('Invalid payload', parseResult.error.flatten());
  }

  const { email, password } = parseResult.data;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

  return res.status(200).json({
    user,
    accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = typeof req.cookies?.[REFRESH_COOKIE_NAME] === 'string' ? req.cookies[REFRESH_COOKIE_NAME] : null;
  if (!refreshToken) {
    throw createBadRequest('Refresh token cookie missing');
  }

  await authService.revokeRefreshToken(refreshToken);

  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
  return res.status(204).send();
});

export const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = typeof req.cookies?.[REFRESH_COOKIE_NAME] === 'string' ? req.cookies[REFRESH_COOKIE_NAME] : null;
  if (!refreshToken) {
    throw createUnauthorized();
  }

  const { user, accessToken, refreshToken: nextRefresh } = await authService.refreshSession(refreshToken);

  res.cookie(REFRESH_COOKIE_NAME, nextRefresh, cookieOptions);

  return res.status(200).json({
    user,
    accessToken,
  });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw createUnauthorized();
  }

  return res.status(200).json({
    user: {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw createUnauthorized();
  }

  const parseResult = profileUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw createBadRequest('Invalid payload', parseResult.error.flatten());
  }

  const user = await authService.updateProfile(req.user.sub, parseResult.data);

  return res.status(200).json({ user });
});
