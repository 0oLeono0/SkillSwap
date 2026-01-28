import type { Prisma, PrismaClient } from '@prisma/client';
import type { UserSkillType } from '../types/userSkillType.js';
import { prisma } from '../lib/prisma.js';

type DbClient = PrismaClient | Prisma.TransactionClient;

const getClient = (client?: DbClient) => client ?? prisma;

export const userSkillRepository = {
  findById(id: string, client?: DbClient) {
    return getClient(client).userSkill.findUnique({ where: { id } });
  },

  findByUserAndType(userId: string, type: UserSkillType, client?: DbClient) {
    return getClient(client).userSkill.findMany({ where: { userId, type } });
  },

  createMany(data: Prisma.UserSkillCreateManyInput[], client?: DbClient) {
    if (data.length === 0) {
      return Promise.resolve({ count: 0 });
    }
    return getClient(client).userSkill.createMany({ data });
  },

  updateById(
    id: string,
    data: Prisma.UserSkillUpdateInput | Prisma.UserSkillUncheckedUpdateInput,
    client?: DbClient
  ) {
    return getClient(client).userSkill.update({ where: { id }, data });
  },

  deleteByIds(ids: string[], client?: DbClient) {
    if (ids.length === 0) {
      return Promise.resolve({ count: 0 });
    }
    return getClient(client).userSkill.deleteMany({
      where: { id: { in: ids } }
    });
  },

  deleteByUserAndType(userId: string, type: UserSkillType, client?: DbClient) {
    return getClient(client).userSkill.deleteMany({ where: { userId, type } });
  }
};
