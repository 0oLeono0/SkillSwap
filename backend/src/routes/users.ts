import { Router } from 'express';
import { listUsers, listCatalogUsers } from '../controllers/userController.js';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { USER_ROLE } from '../types/userRole.js';

export const usersRouter = Router();

usersRouter.get('/public', listCatalogUsers);
usersRouter.get(
  '/',
  authenticateAccessToken,
  authorizeRole(USER_ROLE.owner, USER_ROLE.admin),
  listUsers
);
