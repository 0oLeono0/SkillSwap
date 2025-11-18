import { Router } from 'express';
import { deleteUserAccount, listUsersForOwner, updateUserRole } from '../controllers/adminController.js';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

export const adminRouter = Router();

adminRouter.use(authenticateAccessToken);

adminRouter.get('/users', authorizeRole('owner'), listUsersForOwner);
adminRouter.patch('/users/:userId/role', authorizeRole('owner'), updateUserRole);
adminRouter.delete('/users/:userId', authorizeRole('admin', 'owner'), deleteUserAccount);
