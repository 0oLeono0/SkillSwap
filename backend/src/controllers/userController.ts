import { asyncHandler } from '../middleware/asyncHandler.js';
import { userService } from '../services/userService.js';

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await userService.listUsers();
  return res.status(200).json({ users });
});

export const listCatalogUsers = asyncHandler(async (_req, res) => {
  const users = await userService.listPublicUsers();
  return res.status(200).json({ users });
});
