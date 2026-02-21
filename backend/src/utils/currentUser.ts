import type { Request } from 'express';
import type { AccessTokenPayload } from '../services/tokenService.js';
import { createUnauthorized } from './httpErrors.js';

export const requireCurrentUser = (req: Request): AccessTokenPayload => {
  if (!req.user) {
    throw createUnauthorized();
  }

  return req.user;
};
