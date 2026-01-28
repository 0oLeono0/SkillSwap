import { Router } from 'express';
import {
  deleteUserAccount,
  listUsersForOwner,
  updateUserRole
} from '../controllers/adminController.js';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { USER_ROLE } from '../types/userRole.js';

export const adminRouter = Router();

adminRouter.use(authenticateAccessToken);

adminRouter.get('/users', authorizeRole(USER_ROLE.owner), listUsersForOwner);
adminRouter.patch(
  '/users/:userId/role',
  authorizeRole(USER_ROLE.owner),
  updateUserRole
);
adminRouter.delete(
  '/users/:userId',
  authorizeRole(USER_ROLE.admin, USER_ROLE.owner),
  deleteUserAccount
);
