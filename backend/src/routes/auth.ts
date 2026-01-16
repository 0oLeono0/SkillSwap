import { Router } from 'express';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import { config } from '../config/env.js';
import {
  authRateLimitKey,
  createRateLimiter,
  createRateLimitStore,
  ipRateLimitKey,
} from '../middleware/rateLimit.js';
import { login, logout, me, refreshSession, register, updateProfile } from '../controllers/authController.js';

export const authRouter = Router();

const rateLimitStore = createRateLimitStore();

const registerLimiter = createRateLimiter({
  windowMs: config.rateLimit.register.windowMs,
  max: config.rateLimit.register.max,
  keyGenerator: authRateLimitKey,
  prefix: 'auth:register',
  store: rateLimitStore,
});

const loginLimiter = createRateLimiter({
  windowMs: config.rateLimit.login.windowMs,
  max: config.rateLimit.login.max,
  keyGenerator: authRateLimitKey,
  prefix: 'auth:login',
  store: rateLimitStore,
});

const refreshLimiter = createRateLimiter({
  windowMs: config.rateLimit.refresh.windowMs,
  max: config.rateLimit.refresh.max,
  keyGenerator: ipRateLimitKey,
  prefix: 'auth:refresh',
  store: rateLimitStore,
});

authRouter.post('/register', registerLimiter, register);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/refresh', refreshLimiter, refreshSession);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticateAccessToken, me);
authRouter.patch('/me', authenticateAccessToken, updateProfile);
