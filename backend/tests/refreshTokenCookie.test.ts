import { describe, expect, it, jest } from '@jest/globals';
import type { Request, Response } from 'express';
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie
} from '../src/utils/refreshTokenCookie.js';

const createRequest = (cookies: unknown): Request => ({ cookies }) as Request;

const createResponse = (): Response =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn()
  }) as unknown as Response;

describe('refreshTokenCookie utils', () => {
  it('returns refresh token when cookie exists', () => {
    const req = createRequest({ refreshToken: 'token-value' });

    expect(getRefreshTokenCookie(req)).toBe('token-value');
  });

  it('returns null when cookie is missing or invalid', () => {
    expect(getRefreshTokenCookie(createRequest(undefined))).toBeNull();
    expect(
      getRefreshTokenCookie(createRequest({ refreshToken: 123 }))
    ).toBeNull();
  });

  it('sets refresh token cookie with standard options', () => {
    const res = createResponse();

    setRefreshTokenCookie(res, 'token-value', 1234);

    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'token-value',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 1234
      })
    );
  });

  it('clears refresh token cookie with standard options', () => {
    const res = createResponse();

    clearRefreshTokenCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: '/api/auth'
      })
    );
  });
});
