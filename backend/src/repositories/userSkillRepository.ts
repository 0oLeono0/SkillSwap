import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type DbClient = PrismaClient | Prisma.TransactionClient;

const getClient = (client?: DbClient) => client ?? prisma;

export const userSkillRepository = {
  createMany(data: Prisma.UserSkillCreateManyInput[], client?: DbClient) {
    if (data.length === 0) {
      return Promise.resolve({ count: 0 });
    }
    return getClient(client).userSkill.createMany({ data });
  },

  deleteByUserAndType(userId: string, type: string, client?: DbClient) {
    return getClient(client).userSkill.deleteMany({ where: { userId, type } });
  }
};
