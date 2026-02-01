import {
  REQUEST_STATUS,
  REQUEST_STATUSES,
  type RequestStatus
} from '../types/requestStatus.js';
import { requestRepository } from '../repositories/requestRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { userSkillRepository } from '../repositories/userSkillRepository.js';
import { exchangeService } from './exchangeService.js';
import { prisma } from '../lib/prisma.js';
import {
  createBadRequest,
  createConflict,
  createForbidden,
  createNotFound
} from '../utils/httpErrors.js';
import {
  mapRequestSkill,
  type RequestSkillRecord
} from '../mappers/requestSkill.js';

const allowedStatuses = new Set<RequestStatus>(REQUEST_STATUSES);

type RequestParticipant = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type RequestRecord = RequestSkillRecord & {
  id: string;
  status: RequestStatus;
  fromUserId: string;
  toUserId: string;
  createdAt: Date;
  updatedAt: Date;
  fromUser?: RequestParticipant | null;
  toUser?: RequestParticipant | null;
};

const mapRequest = (request: RequestRecord) => ({
  id: request.id,
  userSkillId: request.userSkillId,
  skill: mapRequestSkill(request),
  status: request.status,
  fromUserId: request.fromUserId,
  toUserId: request.toUserId,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
  fromUser: request.fromUser ?? undefined,
  toUser: request.toUser ?? undefined
});

export const requestService = {
  async listForUser(userId: string) {
    const requests = (await requestRepository.findForUser(
      userId
    )) as RequestRecord[];

    const incoming = [];
    const outgoing = [];

    for (const request of requests) {
      if (request.toUserId === userId) {
        incoming.push(mapRequest(request));
      } else {
        outgoing.push(mapRequest(request));
      }
    }

    return { incoming, outgoing };
  },

  async createRequest(
    fromUserId: string,
    toUserId: string,
    userSkillId: string
  ) {
    if (fromUserId === toUserId) {
      throw createBadRequest('Нельзя отправлять заявку самому себе');
    }

    const targetUser = await userRepository.findById(toUserId);
    if (!targetUser) {
      throw createNotFound('Пользователь не найден');
    }

    const targetSkill = await userSkillRepository.findById(userSkillId);
    if (!targetSkill) {
      throw createBadRequest('Skill not found');
    }
    if (targetSkill.userId !== toUserId) {
      throw createForbidden(
        'Cannot create request for a skill that does not belong to the target user'
      );
    }

    const existing = await requestRepository.findPendingDuplicate(
      fromUserId,
      toUserId,
      userSkillId
    );
    if (existing) {
      return mapRequest(existing as RequestRecord);
    }

    const request = await requestRepository.create({
      fromUserId,
      toUserId,
      userSkillId,
      skillTitle: targetSkill.title.trim(),
      skillType: targetSkill.type,
      skillSubcategoryId: targetSkill.subcategoryId ?? null,
      skillCategoryId: targetSkill.categoryId ?? null
    });

    return mapRequest(request as RequestRecord);
  },

  async updateStatus(requestId: string, userId: string, status: RequestStatus) {
    if (!allowedStatuses.has(status)) {
      throw createBadRequest('Неверный статус заявки');
    }

    const request = (await requestRepository.findById(
      requestId
    )) as RequestRecord | null;
    if (!request) {
      throw createNotFound('Заявка не найдена');
    }

    if (request.fromUserId !== userId && request.toUserId !== userId) {
      throw createForbidden('Недостаточно прав для изменения статуса заявки');
    }

    if (status === REQUEST_STATUS.accepted && request.toUserId !== userId) {
      throw createForbidden('Только получатель может принять заявку');
    }

    if (status === REQUEST_STATUS.rejected && request.toUserId !== userId) {
      throw createForbidden('Только получатель может отклонить заявку');
    }

    if (request.status === status) {
      return mapRequest(request);
    }

    if (request.status !== REQUEST_STATUS.pending) {
      throw createConflict(
        'Статус заявки можно менять только пока она в ожидании.'
      );
    }

    if (status === REQUEST_STATUS.accepted) {
      const updatedRequest = await prisma.$transaction(async (tx) => {
        const request = await requestRepository.updateStatus(
          requestId,
          status,
          tx
        );
        await exchangeService.ensureCreatedFromRequest(request, tx);
        return request;
      });

      return mapRequest(updatedRequest as RequestRecord);
    }

    const updatedRequest = await requestRepository.updateStatus(
      requestId,
      status
    );

    return mapRequest(updatedRequest as RequestRecord);
  }
};
