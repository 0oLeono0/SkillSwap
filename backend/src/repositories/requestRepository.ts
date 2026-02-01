import type { Prisma, PrismaClient } from '@prisma/client';
import { REQUEST_STATUS, type RequestStatus } from '../types/requestStatus.js';
import { prisma } from '../lib/prisma.js';

type DbClient = PrismaClient | Prisma.TransactionClient;

const getClient = (client?: DbClient) => client ?? prisma;

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
  findForUser(userId: string, client?: DbClient) {
    return getClient(client).request.findMany({
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
    userSkillId: string,
    client?: DbClient
  ) {
    return getClient(client).request.findFirst({
      where: {
        fromUserId,
        toUserId,
        userSkillId,
        status: REQUEST_STATUS.pending
      },
      include: defaultInclude
    });
  },

  create(data: Prisma.RequestUncheckedCreateInput, client?: DbClient) {
    return getClient(client).request.create({
      data,
      include: defaultInclude
    });
  },

  findById(id: string, client?: DbClient) {
    return getClient(client).request.findUnique({
      where: { id },
      include: defaultInclude
    });
  },

  updateStatus(id: string, status: RequestStatus, client?: DbClient) {
    return getClient(client).request.update({
      where: { id },
      data: { status },
      include: defaultInclude
    });
  }
};
