import { Router } from 'express';
import { listUsers, listCatalogUsers } from '../controllers/userController.js';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

export const usersRouter = Router();

usersRouter.get('/public', listCatalogUsers);
usersRouter.get('/', authenticateAccessToken, authorizeRole('owner', 'admin'), listUsers);
