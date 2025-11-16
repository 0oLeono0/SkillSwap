import { asyncHandler } from '../middleware/asyncHandler.js';
import { favoriteService } from '../services/favoriteService.js';
import { createBadRequest } from '../utils/httpErrors.js';

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await favoriteService.list(req.user!.sub);
  return res.status(200).json({ favorites });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body as { targetUserId?: string };
  if (!targetUserId) {
    throw createBadRequest('Не указан идентификатор пользователя');
  }

  const favorite = await favoriteService.add(req.user!.sub, targetUserId);
  return res.status(201).json({ favorite: { targetUserId: favorite.targetUserId } });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const { targetUserId } = req.params;
  if (!targetUserId) {
    throw createBadRequest('Не указан идентификатор пользователя');
  }

  await favoriteService.remove(req.user!.sub, targetUserId);
  return res.status(204).send();
});

export const clearFavorites = asyncHandler(async (req, res) => {
  await favoriteService.clear(req.user!.sub);
  return res.status(204).send();
});
