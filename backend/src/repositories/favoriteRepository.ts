import { prisma } from '../lib/prisma.js';

export const favoriteRepository = {
  listByUserId(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  find(userId: string, targetUserId: string) {
    return prisma.favorite.findUnique({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId,
        },
      },
    });
  },

  create(userId: string, targetUserId: string) {
    return prisma.favorite.create({
      data: {
        userId,
        targetUserId,
      },
    });
  },

  delete(userId: string, targetUserId: string) {
    return prisma.favorite.delete({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId,
        },
      },
    });
  },

  deleteAll(userId: string) {
    return prisma.favorite.deleteMany({
      where: { userId },
    });
  },
};
