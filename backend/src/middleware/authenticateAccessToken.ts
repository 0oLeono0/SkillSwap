import type { RequestHandler } from 'express';
import { tokenService } from '../services/tokenService.js';
import { createUnauthorized } from '../utils/httpErrors.js';

export const authenticateAccessToken: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createUnauthorized());
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return next(createUnauthorized());
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch {
    return next(createUnauthorized());
  }
};
