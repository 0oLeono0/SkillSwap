import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const participantSelect = {
  select: {
    id: true,
    name: true,
    avatarUrl: true,
  },
} as const;

const defaultInclude = {
  fromUser: participantSelect,
  toUser: participantSelect,
} satisfies Prisma.RequestInclude;

export const requestRepository = {
  findForUser(userId: string) {
    return prisma.request.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: defaultInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  findPendingDuplicate(fromUserId: string, toUserId: string, skillId: string) {
    return prisma.request.findFirst({
      where: {
        fromUserId,
        toUserId,
        skillId,
        status: 'pending',
      },
      include: defaultInclude,
    });
  },

  create(data: Prisma.RequestUncheckedCreateInput) {
    return prisma.request.create({
      data,
      include: defaultInclude,
    });
  },

  findById(id: string) {
    return prisma.request.findUnique({
      where: { id },
      include: defaultInclude,
    });
  },

  updateStatus(id: string, status: string) {
    return prisma.request.update({
      where: { id },
      data: { status },
      include: defaultInclude,
    });
  },
};
