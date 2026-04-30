import { Prisma, type PrismaClient, type Request } from '@prisma/client';
import type {
  CreateExchangeRatingPayload,
  ExchangeRatingDto
} from '@skillswap/contracts/ratings';
import { exchangeRepository } from '../repositories/exchangeRepository.js';
import {
  createBadRequest,
  createConflict,
  createForbidden,
  createNotFound
} from '../utils/httpErrors.js';
import { NOT_FOUND_MESSAGES } from '../utils/errorMessages.js';
import {
  EXCHANGE_STATUS,
  type ExchangeStatus
} from '../types/exchangeStatus.js';
import {
  mapRequestSkill,
  type RequestSkillRecord
} from '../mappers/requestSkill.js';

type DbClient = PrismaClient | Prisma.TransactionClient;

type ExchangeParticipant = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type ExchangeMessage = {
  id: string;
  exchangeId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: ExchangeParticipant;
};

type ExchangeRequestRecord = RequestSkillRecord & {
  id: string;
  userSkillId: string | null;
  createdAt: Date;
};

type ExchangeRecord = {
  id: string;
  status: ExchangeStatus;
  confirmedAt: Date;
  completedAt: Date | null;
  initiatorId: string;
  recipientId: string;
  request: ExchangeRequestRecord;
  initiator: ExchangeParticipant;
  recipient: ExchangeParticipant;
};

type ExchangeDetailRecord = ExchangeRecord & {
  messages: ExchangeMessage[];
};

type ExchangeRatingRecord = {
  id: string;
  exchangeId: string;
  raterId: string;
  ratedUserId: string;
  score: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const mapExchangeRequest = (request: ExchangeRequestRecord) => ({
  id: request.id,
  userSkillId: request.userSkillId,
  createdAt: request.createdAt,
  skill: mapRequestSkill(request)
});

const mapExchange = (exchange: ExchangeRecord) => ({
  id: exchange.id,
  status: exchange.status,
  confirmedAt: exchange.confirmedAt,
  completedAt: exchange.completedAt,
  request: mapExchangeRequest(exchange.request),
  initiator: exchange.initiator,
  recipient: exchange.recipient
});

const mapExchangeDetails = (exchange: ExchangeDetailRecord) => ({
  ...mapExchange(exchange),
  messages: exchange.messages
});

const mapExchangeRating = (
  rating: ExchangeRatingRecord
): ExchangeRatingDto => ({
  id: rating.id,
  exchangeId: rating.exchangeId,
  raterId: rating.raterId,
  ratedUserId: rating.ratedUserId,
  score: rating.score,
  comment: rating.comment,
  createdAt: rating.createdAt.toISOString(),
  updatedAt: rating.updatedAt.toISOString()
});

const ensureParticipant = (
  exchange: { initiatorId: string; recipientId: string },
  userId: string
) => {
  if (exchange.initiatorId !== userId && exchange.recipientId !== userId) {
    throw createForbidden('Недостаточно прав для работы с этим обменом');
  }
};

const getRatedUserId = (
  exchange: { initiatorId: string; recipientId: string },
  raterId: string
) =>
  exchange.initiatorId === raterId
    ? exchange.recipientId
    : exchange.initiatorId;

const normalizeRatingPayload = (payload: CreateExchangeRatingPayload) => {
  if (
    !Number.isInteger(payload.score) ||
    payload.score < 1 ||
    payload.score > 5
  ) {
    throw createBadRequest('Оценка должна быть целым числом от 1 до 5');
  }

  const data: { score: number; comment?: string | null } = {
    score: payload.score
  };

  if (payload.comment === undefined) {
    return data;
  }

  if (payload.comment === null) {
    data.comment = null;
    return data;
  }

  const comment = payload.comment.trim();
  if (!comment) {
    throw createBadRequest('Комментарий не может быть пустым');
  }
  if (comment.length > 500) {
    throw createBadRequest('Комментарий не должен быть длиннее 500 символов');
  }

  data.comment = comment;
  return data;
};

export const exchangeService = {
  async ensureCreatedFromRequest(
    request: Pick<Request, 'id' | 'fromUserId' | 'toUserId'>,
    client?: DbClient
  ) {
    const findByRequestId = (requestId: string) =>
      client
        ? exchangeRepository.findByRequestId(requestId, client)
        : exchangeRepository.findByRequestId(requestId);
    const createFromRequest = (data: {
      requestId: string;
      initiatorId: string;
      recipientId: string;
    }) =>
      client
        ? exchangeRepository.createFromRequest(data, client)
        : exchangeRepository.createFromRequest(data);

    const existing = await findByRequestId(request.id);
    if (existing) {
      return existing;
    }

    try {
      return await createFromRequest({
        requestId: request.id,
        initiatorId: request.fromUserId,
        recipientId: request.toUserId
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const fallback = await findByRequestId(request.id);
        if (fallback) {
          return fallback;
        }
      }
      throw error;
    }
  },

  async listForUser(userId: string) {
    const exchanges = (await exchangeRepository.listForUser(
      userId
    )) as ExchangeRecord[];
    return exchanges.map(mapExchange);
  },

  async getDetails(exchangeId: string, userId: string) {
    const exchange = (await exchangeRepository.findDetailedById(
      exchangeId
    )) as ExchangeDetailRecord | null;
    if (!exchange) {
      throw createNotFound(NOT_FOUND_MESSAGES.exchangeNotFound);
    }

    ensureParticipant(exchange, userId);
    return mapExchangeDetails(exchange);
  },

  async sendMessage(exchangeId: string, userId: string, content: string) {
    const exchange = await exchangeRepository.findSummaryById(exchangeId);
    if (!exchange) {
      throw createNotFound(NOT_FOUND_MESSAGES.exchangeNotFound);
    }

    ensureParticipant(exchange, userId);
    if (exchange.status === EXCHANGE_STATUS.completed) {
      throw createBadRequest(
        'Нельзя отправлять сообщения в завершенном обмене'
      );
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw createBadRequest('Сообщение не может быть пустым');
    }

    return exchangeRepository.createMessage(exchangeId, userId, trimmed);
  },

  async completeExchange(exchangeId: string, userId: string) {
    const exchange = (await exchangeRepository.findSummaryById(
      exchangeId
    )) as ExchangeRecord | null;
    if (!exchange) {
      throw createNotFound(NOT_FOUND_MESSAGES.exchangeNotFound);
    }

    ensureParticipant(exchange, userId);
    if (exchange.status === EXCHANGE_STATUS.completed) {
      return mapExchange(exchange);
    }

    const updated = (await exchangeRepository.markCompleted(
      exchangeId
    )) as ExchangeRecord;
    return mapExchange(updated);
  },

  async rateExchange(
    exchangeId: string,
    raterId: string,
    payload: CreateExchangeRatingPayload
  ) {
    const exchange = (await exchangeRepository.findSummaryById(
      exchangeId
    )) as ExchangeRecord | null;
    if (!exchange) {
      throw createNotFound(NOT_FOUND_MESSAGES.exchangeNotFound);
    }

    ensureParticipant(exchange, raterId);
    if (exchange.status !== EXCHANGE_STATUS.completed) {
      throw createBadRequest('Оценить можно только завершенный обмен');
    }

    const ratedUserId = getRatedUserId(exchange, raterId);
    if (ratedUserId === raterId) {
      throw createBadRequest('Нельзя оценить самого себя');
    }

    const existing = await exchangeRepository.findRatingByExchangeAndRater(
      exchangeId,
      raterId
    );
    if (existing) {
      throw createConflict('Вы уже оценили этот обмен');
    }

    const normalizedPayload = normalizeRatingPayload(payload);
    const data: Prisma.ExchangeRatingUncheckedCreateInput = {
      exchangeId,
      raterId,
      ratedUserId,
      score: normalizedPayload.score
    };
    if (normalizedPayload.comment !== undefined) {
      data.comment = normalizedPayload.comment;
    }

    try {
      const rating = (await exchangeRepository.createRating(
        data
      )) as ExchangeRatingRecord;
      return mapExchangeRating(rating);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw createConflict('Вы уже оценили этот обмен');
      }
      throw error;
    }
  }
};
