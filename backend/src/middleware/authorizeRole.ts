import type { RequestHandler } from 'express';
import type { UserRole } from '../types/userRole.js';
import { createForbidden, createUnauthorized } from '../utils/httpErrors.js';

export const authorizeRole = (...allowed: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(createUnauthorized());
    }

    if (!allowed.includes(req.user.role)) {
      return next(createForbidden());
    }

    return next();
  };
};
