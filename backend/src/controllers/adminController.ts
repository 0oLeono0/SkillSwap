import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { adminService } from '../services/adminService.js';
import { createBadRequest } from '../utils/httpErrors.js';
import { userService } from '../services/userService.js';
import { USER_ROLE } from '../types/userRole.js';

const updateRoleSchema = z.object({
  role: z.enum([USER_ROLE.user, USER_ROLE.admin])
});
const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['createdAt', 'name', 'email', 'role']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional()
});

export const deleteUserAccount = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw createBadRequest('User id is required');
  }
  if (req.user?.sub === userId) {
    throw createBadRequest('You cannot delete your own account');
  }
  await adminService.deleteUser(userId);
  return res.status(204).send();
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw createBadRequest('User id is required');
  }
  const payloadResult = updateRoleSchema.safeParse(req.body);
  if (!payloadResult.success) {
    throw createBadRequest('Invalid payload', payloadResult.error.flatten());
  }

  if (req.user?.sub === userId) {
    throw createBadRequest('You cannot change your own role');
  }

  const updatedUser = await adminService.updateUserRole(
    userId,
    payloadResult.data.role
  );
  return res.status(200).json({ user: updatedUser });
});

export const listUsersForOwner = asyncHandler(async (req, res) => {
  const queryResult = listUsersQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    throw createBadRequest('Invalid query params', queryResult.error.flatten());
  }

  const {
    page = 1,
    pageSize = 25,
    search,
    sortBy,
    sortDirection
  } = queryResult.data;
  const requestOptions: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: 'createdAt' | 'name' | 'email' | 'role';
    sortDirection?: 'asc' | 'desc';
  } = { page, pageSize };
  if (search) {
    requestOptions.search = search;
  }
  if (sortBy) {
    requestOptions.sortBy = sortBy;
  }
  if (sortDirection) {
    requestOptions.sortDirection = sortDirection;
  }
  const result = await userService.listUsersForAdmin(requestOptions);

  return res.status(200).json(result);
});
