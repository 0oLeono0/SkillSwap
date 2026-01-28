import {
  REQUEST_STATUS,
  REQUEST_STATUSES,
  type RequestStatus
} from '../types/requestStatus.js';
import { requestRepository } from '../repositories/requestRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { exchangeService } from './exchangeService.js';
import {
  createBadRequest,
  createForbidden,
  createNotFound
} from '../utils/httpErrors.js';

const allowedStatuses = new Set<RequestStatus>(REQUEST_STATUSES);

export const requestService = {
  async listForUser(userId: string) {
    const requests = await requestRepository.findForUser(userId);

    const incoming = [];
    const outgoing = [];

    for (const request of requests) {
      if (request.toUserId === userId) {
        incoming.push(request);
      } else {
        outgoing.push(request);
      }
    }

    return { incoming, outgoing };
  },

  async createRequest(fromUserId: string, toUserId: string, skillId: string) {
    if (fromUserId === toUserId) {
      throw createBadRequest('Нельзя отправлять заявку самому себе');
    }

    const targetUser = await userRepository.findById(toUserId);
    if (!targetUser) {
      throw createNotFound('Пользователь не найден');
    }

    const existing = await requestRepository.findPendingDuplicate(
      fromUserId,
      toUserId,
      skillId
    );
    if (existing) {
      return existing;
    }

    return requestRepository.create({
      fromUserId,
      toUserId,
      skillId
    });
  },

  async updateStatus(requestId: string, userId: string, status: RequestStatus) {
    if (!allowedStatuses.has(status)) {
      throw createBadRequest('Неверный статус заявки');
    }

    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw createNotFound('Заявка не найдена');
    }

    if (request.fromUserId !== userId && request.toUserId !== userId) {
      throw createForbidden('Недостаточно прав для изменения статуса заявки');
    }

    if (status === REQUEST_STATUS.accepted && request.toUserId !== userId) {
      throw createForbidden('Только получатель может подтвердить обмен');
    }

    if (request.status === status) {
      return request;
    }

    const updatedRequest = await requestRepository.updateStatus(
      requestId,
      status
    );

    if (status === REQUEST_STATUS.accepted) {
      await exchangeService.ensureCreatedFromRequest(updatedRequest);
    }

    return updatedRequest;
  }
};
