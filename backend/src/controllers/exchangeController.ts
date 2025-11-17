import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createBadRequest, createUnauthorized } from '../utils/httpErrors.js';
import { exchangeService } from '../services/exchangeService.js';

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const getExchanges = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw createUnauthorized();
  }

  const exchanges = await exchangeService.listForUser(currentUser.sub);
  return res.status(200).json({ exchanges });
});

export const getExchangeDetails = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw createUnauthorized();
  }

  const { exchangeId } = req.params;
  if (!exchangeId) {
    throw createBadRequest('Идентификатор обмена отсутствует');
  }

  const exchange = await exchangeService.getDetails(exchangeId, currentUser.sub);
  return res.status(200).json({ exchange });
});

export const postExchangeMessage = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw createUnauthorized();
  }

  const { exchangeId } = req.params;
  if (!exchangeId) {
    throw createBadRequest('Идентификатор обмена отсутствует');
  }

  const parseResult = messageSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Некорректный текст сообщения', details: parseResult.error.flatten() });
  }

  const message = await exchangeService.sendMessage(exchangeId, currentUser.sub, parseResult.data.content);
  return res.status(201).json({ message });
});

export const completeExchange = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw createUnauthorized();
  }

  const { exchangeId } = req.params;
  if (!exchangeId) {
    throw createBadRequest('Идентификатор обмена отсутствует');
  }

  const exchange = await exchangeService.completeExchange(exchangeId, currentUser.sub);
  return res.status(200).json({ exchange });
});
