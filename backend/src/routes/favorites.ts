import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from '../controllers/favoriteController.js';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';

export const favoritesRouter = Router();

favoritesRouter.use(authenticateAccessToken);
favoritesRouter.get('/', getFavorites);
favoritesRouter.post('/', addFavorite);
favoritesRouter.delete('/', clearFavorites);
favoritesRouter.delete('/:targetUserId', removeFavorite);
