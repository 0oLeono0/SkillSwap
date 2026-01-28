import type { Prisma } from '@prisma/client';
import { REQUEST_STATUS, type RequestStatus } from '../types/requestStatus.js';
import { prisma } from '../lib/prisma.js';

const participantSelect = {
  select: {
    id: true,
    name: true,
    avatarUrl: true
  }
} as const;

const userSkillSelect = {
  select: {
    id: true,
    title: true,
    type: true,
    subcategoryId: true,
    categoryId: true
  }
} as const;

const defaultInclude = {
  fromUser: participantSelect,
  toUser: participantSelect,
  userSkill: userSkillSelect
} satisfies Prisma.RequestInclude;

export const requestRepository = {
  findForUser(userId: string) {
    return prisma.request.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
        status: {
          in: [
            REQUEST_STATUS.pending,
            REQUEST_STATUS.accepted,
            REQUEST_STATUS.rejected
          ]
        }
      },
      include: defaultInclude,
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  findPendingDuplicate(
    fromUserId: string,
    toUserId: string,
    userSkillId: string
  ) {
    return prisma.request.findFirst({
      where: {
        fromUserId,
        toUserId,
        userSkillId,
        status: REQUEST_STATUS.pending
      },
      include: defaultInclude
    });
  },

  create(data: Prisma.RequestUncheckedCreateInput) {
    return prisma.request.create({
      data,
      include: defaultInclude
    });
  },

  findById(id: string) {
    return prisma.request.findUnique({
      where: { id },
      include: defaultInclude
    });
  },

  updateStatus(id: string, status: RequestStatus) {
    return prisma.request.update({
      where: { id },
      data: { status },
      include: defaultInclude
    });
  }
};
