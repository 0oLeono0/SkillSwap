import type { Request } from '@prisma/client';
import { exchangeRepository } from '../repositories/exchangeRepository.js';
import { createBadRequest, createForbidden, createNotFound } from '../utils/httpErrors.js';

const ensureParticipant = (exchange: { initiatorId: string; recipientId: string }, userId: string) => {
  if (exchange.initiatorId !== userId && exchange.recipientId !== userId) {
    throw createForbidden('Недостаточно прав для работы с этим обменом');
  }
};

export const exchangeService = {
  async ensureCreatedFromRequest(request: Pick<Request, 'id' | 'fromUserId' | 'toUserId'>) {
    const existing = await exchangeRepository.findByRequestId(request.id);
    if (existing) {
      return existing;
    }

    return exchangeRepository.createFromRequest({
      requestId: request.id,
      initiatorId: request.fromUserId,
      recipientId: request.toUserId,
    });
  },

  listForUser(userId: string) {
    return exchangeRepository.listForUser(userId);
  },

  async getDetails(exchangeId: string, userId: string) {
    const exchange = await exchangeRepository.findDetailedById(exchangeId);
    if (!exchange) {
      throw createNotFound('Обмен не найден');
    }

    ensureParticipant(exchange, userId);
    return exchange;
  },

  async sendMessage(exchangeId: string, userId: string, content: string) {
    const exchange = await exchangeRepository.findSummaryById(exchangeId);
    if (!exchange) {
      throw createNotFound('Обмен не найден');
    }

    ensureParticipant(exchange, userId);
    if (exchange.status === 'completed') {
      throw createBadRequest('Нельзя отправлять сообщения в завершенном обмене');
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw createBadRequest('Сообщение не может быть пустым');
    }

    return exchangeRepository.createMessage(exchangeId, userId, trimmed);
  },

  async completeExchange(exchangeId: string, userId: string) {
    const exchange = await exchangeRepository.findSummaryById(exchangeId);
    if (!exchange) {
      throw createNotFound('Обмен не найден');
    }

    ensureParticipant(exchange, userId);
    if (exchange.status === 'completed') {
      return exchange;
    }

    return exchangeRepository.markCompleted(exchangeId);
  },
};
