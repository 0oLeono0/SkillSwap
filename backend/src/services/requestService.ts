import { requestRepository } from '../repositories/requestRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { createBadRequest, createForbidden, createNotFound } from '../utils/httpErrors.js';

const allowedStatuses = new Set(['pending', 'accepted', 'rejected', 'inProgress', 'done']);

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
      throw createBadRequest('Нельзя отправить заявку самому себе');
    }

    const targetUser = await userRepository.findById(toUserId);
    if (!targetUser) {
      throw createNotFound('Пользователь не найден');
    }

    const existing = await requestRepository.findPendingDuplicate(fromUserId, toUserId, skillId);
    if (existing) {
      return existing;
    }

    return requestRepository.create({
      fromUserId,
      toUserId,
      skillId,
    });
  },

  async updateStatus(requestId: string, userId: string, status: string) {
    if (!allowedStatuses.has(status)) {
      throw createBadRequest('Недопустимый статус заявки');
    }

    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw createNotFound('Заявка не найдена');
    }

    if (request.fromUserId !== userId && request.toUserId !== userId) {
      throw createForbidden('Нет доступа к этой заявке');
    }

    if (request.status === status) {
      return request;
    }

    return requestRepository.updateStatus(requestId, status);
  },
};
