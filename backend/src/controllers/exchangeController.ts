import type { Request } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createBadRequest, createUnauthorized } from '../utils/httpErrors.js';
import { exchangeService } from '../services/exchangeService.js';

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
});

const exchangeParamsSchema = z.object({
  exchangeId: z.string().min(1, 'Exchange id is required'),
});

const ensureCurrentUser = (req: Request) => {
  if (!req.user) {
    throw createUnauthorized();
  }
  return req.user;
};

const parseExchangeId = (params: unknown) => {
  const result = exchangeParamsSchema.safeParse(params);
  if (!result.success) {
    throw createBadRequest('Некорректный идентификатор обмена', result.error.flatten());
  }
  return result.data.exchangeId;
};

export const getExchanges = asyncHandler(async (req, res) => {
  const currentUser = ensureCurrentUser(req);
  const exchanges = await exchangeService.listForUser(currentUser.sub);
  return res.status(200).json({ exchanges });
});

export const getExchangeDetails = asyncHandler(async (req, res) => {
  const currentUser = ensureCurrentUser(req);
  const exchangeId = parseExchangeId(req.params);
  const exchange = await exchangeService.getDetails(exchangeId, currentUser.sub);
  return res.status(200).json({ exchange });
});

export const postExchangeMessage = asyncHandler(async (req, res) => {
  const currentUser = ensureCurrentUser(req);
  const exchangeId = parseExchangeId(req.params);

  const parseResult = messageSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw createBadRequest('Некорректное тело сообщения', parseResult.error.flatten());
  }

  const message = await exchangeService.sendMessage(exchangeId, currentUser.sub, parseResult.data.content);
  return res.status(201).json({ message });
});

export const completeExchange = asyncHandler(async (req, res) => {
  const currentUser = ensureCurrentUser(req);
  const exchangeId = parseExchangeId(req.params);
  const exchange = await exchangeService.completeExchange(exchangeId, currentUser.sub);
  return res.status(200).json({ exchange });
});
