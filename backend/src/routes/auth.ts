import { Router } from 'express';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import { login, logout, me, refreshSession, register, updateProfile } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshSession);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticateAccessToken, me);
authRouter.patch('/me', authenticateAccessToken, updateProfile);
