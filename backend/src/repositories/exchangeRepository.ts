import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { EXCHANGE_STATUS } from '../types/exchangeStatus.js';

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

const requestSelect = {
  select: {
    id: true,
    userSkillId: true,
    skillTitle: true,
    skillType: true,
    skillSubcategoryId: true,
    skillCategoryId: true,
    createdAt: true,
    userSkill: userSkillSelect
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
  findByRequestId(requestId: string, client?: DbClient) {
    return getClient(client).exchange.findUnique({
      where: { requestId },
      include: defaultInclude
    });
  },

  createFromRequest(
    data: {
      requestId: string;
      initiatorId: string;
      recipientId: string;
      confirmedAt?: Date;
    },
    client?: DbClient
  ) {
    return getClient(client).exchange.create({
      data: {
        requestId: data.requestId,
        initiatorId: data.initiatorId,
        recipientId: data.recipientId,
        confirmedAt: data.confirmedAt ?? new Date()
      },
      include: defaultInclude
    });
  },

  listForUser(userId: string, client?: DbClient) {
    return getClient(client).exchange.findMany({
      where: {
        OR: [{ initiatorId: userId }, { recipientId: userId }]
      },
      include: defaultInclude,
      orderBy: {
        confirmedAt: 'desc'
      }
    });
  },

  findSummaryById(id: string, client?: DbClient) {
    return getClient(client).exchange.findUnique({
      where: { id },
      include: defaultInclude
    });
  },

  findDetailedById(id: string, client?: DbClient) {
    return getClient(client).exchange.findUnique({
      where: { id },
      include: detailInclude
    });
  },

  markCompleted(id: string, client?: DbClient) {
    return getClient(client).exchange.update({
      where: { id },
      data: {
        status: EXCHANGE_STATUS.completed,
        completedAt: new Date()
      },
      include: defaultInclude
    });
  },

  createMessage(
    exchangeId: string,
    senderId: string,
    content: string,
    client?: DbClient
  ) {
    return getClient(client).exchangeMessage.create({
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
