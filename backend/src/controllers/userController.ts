import { asyncHandler } from '../middleware/asyncHandler.js';
import { userService } from '../services/userService.js';
import { BAD_REQUEST_MESSAGES } from '../utils/errorMessages.js';
import { requireStringParam } from '../utils/routeParams.js';

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await userService.listUsers();
  return res.status(200).json({ users });
});

export const listCatalogUsers = asyncHandler(async (_req, res) => {
  const users = await userService.listPublicUsers();
  return res.status(200).json({ users });
});

export const getUserRatings = asyncHandler(async (req, res) => {
  const userId = requireStringParam(
    req.params,
    'userId',
    BAD_REQUEST_MESSAGES.userIdRequired
  );
  const ratings = await userService.getUserRatings(userId);
  return res.status(200).json(ratings);
});
