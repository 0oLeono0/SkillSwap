import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { hashToken } from '../utils/tokenHash.js';

const includeSkills = {
  userSkills: true
};

type DbClient = PrismaClient | Prisma.TransactionClient;

const getClient = (client?: DbClient) => client ?? prisma;

export const userRepository = {
  findByEmail(email: string, client?: DbClient) {
    return getClient(client).user.findUnique({
      where: { email },
      include: includeSkills
    });
  },

  findAll(client?: DbClient) {
    return getClient(client).user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: includeSkills
    });
  },

  findById(id: string, client?: DbClient) {
    return getClient(client).user.findUnique({
      where: { id },
      include: includeSkills
    });
  },

  create(data: Prisma.UserCreateInput, client?: DbClient) {
    return getClient(client).user.create({ data, include: includeSkills });
  },

  updateById(id: string, data: Prisma.UserUpdateInput, client?: DbClient) {
    return getClient(client).user.update({
      where: { id },
      data,
      include: includeSkills
    });
  },

  deleteById(id: string, client?: DbClient) {
    return getClient(client).user.delete({
      where: { id }
    });
  },

  saveRefreshToken(
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    client?: DbClient
  ) {
    return getClient(client).refreshToken.create({
      data: {
        id,
        userId,
        token: tokenHash,
        expiresAt
      }
    });
  },

  findRefreshToken(id: string, client?: DbClient) {
    return getClient(client).refreshToken.findUnique({ where: { id } });
  },

  deleteRefreshTokenById(id: string, client?: DbClient) {
    return getClient(client).refreshToken.deleteMany({ where: { id } });
  },

  deleteRefreshTokenByToken(token: string, client?: DbClient) {
    const tokenHash = hashToken(token);
    return getClient(client).refreshToken.deleteMany({
      where: {
        token: {
          in: [tokenHash, token]
        }
      }
    });
  }
};
