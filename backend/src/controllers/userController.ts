import { asyncHandler } from '../middleware/asyncHandler.js';
import { userService } from '../services/userService.js';

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await userService.listUsers();
  return res.status(200).json({ users });
});
