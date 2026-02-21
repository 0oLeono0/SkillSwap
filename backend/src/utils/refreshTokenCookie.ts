import type { Request, Response } from 'express';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';

const getBaseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: REFRESH_COOKIE_PATH
});

export const getRefreshTokenCookie = (req: Request): string | null =>
  typeof req.cookies?.[REFRESH_COOKIE_NAME] === 'string'
    ? req.cookies[REFRESH_COOKIE_NAME]
    : null;

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
  maxAge: number
) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...getBaseCookieOptions(),
    maxAge
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getBaseCookieOptions());
};
