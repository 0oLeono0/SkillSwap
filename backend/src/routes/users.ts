import { Router } from 'express';
import { listUsers } from '../controllers/userController.js';

export const usersRouter = Router();

usersRouter.get('/', listUsers);
