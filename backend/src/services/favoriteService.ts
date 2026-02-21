import { favoriteRepository } from '../repositories/favoriteRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { createBadRequest, createNotFound } from '../utils/httpErrors.js';
import { NOT_FOUND_MESSAGES } from '../utils/errorMessages.js';

export const favoriteService = {
  async list(userId: string) {
    const favorites = await favoriteRepository.listByUserId(userId);
    return favorites.map((favorite) => favorite.targetUserId);
  },

  async add(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw createBadRequest('Нельзя добавить себя в избранное');
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw createNotFound(NOT_FOUND_MESSAGES.userNotFound);
    }

    const existing = await favoriteRepository.find(userId, targetUserId);
    if (existing) {
      return existing;
    }

    return favoriteRepository.create(userId, targetUserId);
  },

  async remove(userId: string, targetUserId: string) {
    const existing = await favoriteRepository.find(userId, targetUserId);
    if (!existing) {
      return null;
    }

    await favoriteRepository.delete(userId, targetUserId);
    return existing;
  },

  async clear(userId: string) {
    await favoriteRepository.deleteAll(userId);
  }
};
