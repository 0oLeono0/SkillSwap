import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findAll() {
    return prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  updateById(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  saveRefreshToken(id: string, userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        id,
        userId,
        token,
        expiresAt,
      },
    });
  },

  findRefreshToken(id: string) {
    return prisma.refreshToken.findUnique({ where: { id } });
  },

  deleteRefreshTokenById(id: string) {
    return prisma.refreshToken.deleteMany({ where: { id } });
  },

  deleteRefreshTokenByToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
  },
};
