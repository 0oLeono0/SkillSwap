import type { Request } from '@prisma/client';
import { exchangeRepository } from '../repositories/exchangeRepository.js';
import {
  createBadRequest,
  createForbidden,
  createNotFound
} from '../utils/httpErrors.js';
import {
  EXCHANGE_STATUS,
  type ExchangeStatus
} from '../types/exchangeStatus.js';
import {
  mapRequestSkill,
  type RequestSkillRecord
} from '../mappers/requestSkill.js';

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

const ensureParticipant = (
  exchange: { initiatorId: string; recipientId: string },
  userId: string
) => {
  if (exchange.initiatorId !== userId && exchange.recipientId !== userId) {
    throw createForbidden(
      'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ РїСЂР°РІ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ СЌС‚РёРј РѕР±РјРµРЅРѕРј'
    );
  }
};

export const exchangeService = {
  async ensureCreatedFromRequest(
    request: Pick<Request, 'id' | 'fromUserId' | 'toUserId'>
  ) {
    const existing = await exchangeRepository.findByRequestId(request.id);
    if (existing) {
      return existing;
    }

    return exchangeRepository.createFromRequest({
      requestId: request.id,
      initiatorId: request.fromUserId,
      recipientId: request.toUserId
    });
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
      throw createNotFound('РћР±РјРµРЅ РЅРµ РЅР°Р№РґРµРЅ');
    }

    ensureParticipant(exchange, userId);
    return mapExchangeDetails(exchange);
  },

  async sendMessage(exchangeId: string, userId: string, content: string) {
    const exchange = await exchangeRepository.findSummaryById(exchangeId);
    if (!exchange) {
      throw createNotFound('РћР±РјРµРЅ РЅРµ РЅР°Р№РґРµРЅ');
    }

    ensureParticipant(exchange, userId);
    if (exchange.status === EXCHANGE_STATUS.completed) {
      throw createBadRequest(
        'РќРµР»СЊР·СЏ РѕС‚РїСЂР°РІР»СЏС‚СЊ СЃРѕРѕР±С‰РµРЅРёСЏ РІ Р·Р°РІРµСЂС€РµРЅРЅРѕРј РѕР±РјРµРЅРµ'
      );
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw createBadRequest(
        'РЎРѕРѕР±С‰РµРЅРёРµ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РїСѓСЃС‚С‹Рј'
      );
    }

    return exchangeRepository.createMessage(exchangeId, userId, trimmed);
  },

  async completeExchange(exchangeId: string, userId: string) {
    const exchange = (await exchangeRepository.findSummaryById(
      exchangeId
    )) as ExchangeRecord | null;
    if (!exchange) {
      throw createNotFound('РћР±РјРµРЅ РЅРµ РЅР°Р№РґРµРЅ');
    }

    ensureParticipant(exchange, userId);
    if (exchange.status === EXCHANGE_STATUS.completed) {
      return mapExchange(exchange);
    }

    const updated = (await exchangeRepository.markCompleted(
      exchangeId
    )) as ExchangeRecord;
    return mapExchange(updated);
  }
};
