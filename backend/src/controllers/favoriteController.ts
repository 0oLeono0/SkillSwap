import { z } from 'zod';
import type { Request } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { favoriteService } from '../services/favoriteService.js';
import { createBadRequest, createUnauthorized } from '../utils/httpErrors.js';

const targetUserSchema = z.object({
  targetUserId: z.string().min(1, 'Target user id is required'),
});

const ensureCurrentUser = (req: Request) => {
  if (!req.user) {
    throw createUnauthorized();
  }
  return req.user;
};

export const getFavorites = asyncHandler(async (req, res) => {
  const currentUser = ensureCurrentUser(req);
  const favorites = await favoriteService.list(currentUser.sub);
  return res.status(200).json({ favorites });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const currentUser = ensureCurrentUser(req);
  const result = targetUserSchema.safeParse(req.body);
  if (!result.success) {
    throw createBadRequest('Некорректный запрос', result.error.flatten());
  }

  const favorite = await favoriteService.add(currentUser.sub, result.data.targetUserId);
  return res.status(201).json({ favorite: { targetUserId: favorite.targetUserId } });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const currentUser = ensureCurrentUser(req);
  const result = targetUserSchema.safeParse(req.params);
  if (!result.success) {
    throw createBadRequest('Некорректный запрос', result.error.flatten());
  }

  await favoriteService.remove(currentUser.sub, result.data.targetUserId);
  return res.status(204).send();
});

export const clearFavorites = asyncHandler(async (req, res) => {
  const currentUser = ensureCurrentUser(req);
  await favoriteService.clear(currentUser.sub);
  return res.status(204).send();
});
