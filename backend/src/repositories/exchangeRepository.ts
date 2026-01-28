import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { EXCHANGE_STATUS } from '../types/exchangeStatus.js';

const participantSelect = {
  select: {
    id: true,
    name: true,
    avatarUrl: true
  }
} as const;

const requestSelect = {
  select: {
    id: true,
    skillId: true,
    createdAt: true
  }
} as const;

const defaultInclude = {
  request: requestSelect,
  initiator: participantSelect,
  recipient: participantSelect
} satisfies Prisma.ExchangeInclude;

const detailInclude = {
  ...defaultInclude,
  messages: {
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      sender: participantSelect
    }
  }
} satisfies Prisma.ExchangeInclude;

export const exchangeRepository = {
  findByRequestId(requestId: string) {
    return prisma.exchange.findUnique({
      where: { requestId },
      include: defaultInclude
    });
  },

  createFromRequest(data: {
    requestId: string;
    initiatorId: string;
    recipientId: string;
    confirmedAt?: Date;
  }) {
    return prisma.exchange.create({
      data: {
        requestId: data.requestId,
        initiatorId: data.initiatorId,
        recipientId: data.recipientId,
        confirmedAt: data.confirmedAt ?? new Date()
      },
      include: defaultInclude
    });
  },

  listForUser(userId: string) {
    return prisma.exchange.findMany({
      where: {
        OR: [{ initiatorId: userId }, { recipientId: userId }]
      },
      include: defaultInclude,
      orderBy: {
        confirmedAt: 'desc'
      }
    });
  },

  findSummaryById(id: string) {
    return prisma.exchange.findUnique({
      where: { id },
      include: defaultInclude
    });
  },

  findDetailedById(id: string) {
    return prisma.exchange.findUnique({
      where: { id },
      include: detailInclude
    });
  },

  markCompleted(id: string) {
    return prisma.exchange.update({
      where: { id },
      data: {
        status: EXCHANGE_STATUS.completed,
        completedAt: new Date()
      },
      include: defaultInclude
    });
  },

  createMessage(exchangeId: string, senderId: string, content: string) {
    return prisma.exchangeMessage.create({
      data: {
        exchangeId,
        senderId,
        content
      },
      include: {
        sender: participantSelect
      }
    });
  }
};
