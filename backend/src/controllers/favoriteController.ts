import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { favoriteService } from '../services/favoriteService.js';
import { parseOrBadRequest } from '../utils/validation.js';
import { requireCurrentUser } from '../utils/currentUser.js';

const targetUserSchema = z.object({
  targetUserId: z.string().min(1, 'Target user id is required')
});

export const getFavorites = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  const favorites = await favoriteService.list(currentUser.sub);
  return res.status(200).json({ favorites });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  const payload = parseOrBadRequest(targetUserSchema, req.body);
  const favorite = await favoriteService.add(
    currentUser.sub,
    payload.targetUserId
  );
  return res
    .status(201)
    .json({ favorite: { targetUserId: favorite.targetUserId } });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  const params = parseOrBadRequest(targetUserSchema, req.params);

  await favoriteService.remove(currentUser.sub, params.targetUserId);
  return res.status(204).send();
});

export const clearFavorites = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  await favoriteService.clear(currentUser.sub);
  return res.status(204).send();
});
