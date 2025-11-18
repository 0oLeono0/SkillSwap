import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { adminService } from '../services/adminService.js';
import { createBadRequest } from '../utils/httpErrors.js';
import { userService } from '../services/userService.js';

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

export const deleteUserAccount = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw createBadRequest('User id is required');
  }
  await adminService.deleteUser(userId);
  return res.status(204).send();
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const payloadResult = updateRoleSchema.safeParse(req.body);
  if (!payloadResult.success) {
    throw createBadRequest('Invalid payload', payloadResult.error.flatten());
  }

  const updatedUser = await adminService.updateUserRole(userId, payloadResult.data.role);
  return res.status(200).json({ user: updatedUser });
});

export const listUsersForOwner = asyncHandler(async (_req, res) => {
  const users = await userService.listUsers();
  return res.status(200).json({ users });
});
