import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const userSkillRepository = {
  createMany(data: Prisma.UserSkillCreateManyInput[]) {
    if (data.length === 0) {
      return Promise.resolve({ count: 0 });
    }
    return prisma.userSkill.createMany({ data });
  },

  deleteByUserAndType(userId: string, type: string) {
    return prisma.userSkill.deleteMany({ where: { userId, type } });
  }
};
