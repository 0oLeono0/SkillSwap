import crypto from 'node:crypto';
import { userRepository } from '../repositories/userRepository.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createConflict, createUnauthorized } from '../utils/httpErrors.js';
import { tokenService } from './tokenService.js';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const sanitizeUser = (user: Awaited<ReturnType<typeof userRepository.findById>>) => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

export const authService = {
  async register({ email, password, name }: RegisterInput) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw createConflict('User with this email already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({
      email,
      passwordHash,
      name,
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
