import { authService } from '../services/authService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { refreshTtlMs } from '../services/tokenService.js';
import { createBadRequest, createUnauthorized } from '../utils/httpErrors.js';
import { BAD_REQUEST_MESSAGES } from '../utils/errorMessages.js';
import { requireCurrentUser } from '../utils/currentUser.js';
import { parseOrBadRequest } from '../utils/validation.js';
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie
} from '../utils/refreshTokenCookie.js';
import {
  loginPayloadSchema,
  registerPayloadSchema,
  updateProfilePayloadSchema
} from '@skillswap/contracts/authSchemas';

export const register = asyncHandler(async (req, res) => {
  const payload = parseOrBadRequest(registerPayloadSchema, req.body);

  const {
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
  } = payload;
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
    learningSkills
  });

  setRefreshTokenCookie(res, refreshToken, refreshTtlMs);

  return res.status(201).json({
    user,
    accessToken
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = parseOrBadRequest(loginPayloadSchema, req.body);
  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password
  });

  setRefreshTokenCookie(res, refreshToken, refreshTtlMs);

  return res.status(200).json({
    user,
    accessToken
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenCookie(req);
  if (!refreshToken) {
    throw createBadRequest(BAD_REQUEST_MESSAGES.refreshTokenCookieMissing);
  }

  await authService.revokeRefreshToken(refreshToken);

  clearRefreshTokenCookie(res);
  return res.status(204).send();
});

export const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenCookie(req);
  if (!refreshToken) {
    throw createUnauthorized();
  }

  const {
    user,
    accessToken,
    refreshToken: nextRefresh
  } = await authService.refreshSession(refreshToken);

  setRefreshTokenCookie(res, nextRefresh, refreshTtlMs);

  return res.status(200).json({
    user,
    accessToken
  });
});

export const me = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);

  return res.status(200).json({
    user: {
      id: currentUser.sub,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);

  const updates = parseOrBadRequest(updateProfilePayloadSchema, req.body);

  const user = await authService.updateProfile(currentUser.sub, updates);

  return res.status(200).json({ user });
});
