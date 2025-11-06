import jwt, { type SignOptions } from 'jsonwebtoken';
import ms from 'ms';
import { config } from '../config/env.js';
import type { RefreshToken } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

type MsStringValue = Parameters<typeof ms>[0];

const parseExpiry = (value: string): number => {
  const duration = ms(value as MsStringValue);
  if (typeof duration !== 'number') {
    throw new Error(`Invalid duration format: ${value}`);
  }
  return duration;
};

export const refreshTtlMs = parseExpiry(config.jwt.refreshExpiresIn);

const accessExpiresIn = config.jwt.accessExpiresIn as MsStringValue;
const refreshExpiresIn = config.jwt.refreshExpiresIn as MsStringValue;

export const tokenService = {
  createAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = { expiresIn: accessExpiresIn };
    return jwt.sign(payload, config.jwt.accessSecret, options);
  },

  createRefreshToken(payload: RefreshTokenPayload): { token: string; expiresAt: Date } {
    const options: SignOptions = { expiresIn: refreshExpiresIn };
    const token = jwt.sign(payload, config.jwt.refreshSecret, options);
    const expiresAt = new Date(Date.now() + refreshTtlMs);
    return { token, expiresAt };
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
  },

  mapDbRefreshToken(record: RefreshToken): RefreshTokenPayload {
    return {
      sub: record.userId,
      tokenId: record.id,
    };
  },
};
