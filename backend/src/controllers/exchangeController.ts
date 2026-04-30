import { z } from 'zod';
import { createExchangeRatingPayloadSchema } from '@skillswap/contracts/ratingSchemas';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireCurrentUser } from '../utils/currentUser.js';
import { BAD_REQUEST_MESSAGES } from '../utils/errorMessages.js';
import { parseOrBadRequest } from '../utils/validation.js';
import { exchangeService } from '../services/exchangeService.js';

const messageSchema = z.object({
  content: z.string().min(1).max(2000)
});

const exchangeParamsSchema = z.object({
  exchangeId: z.string().min(1, 'Exchange id is required')
});

const parseExchangeId = (params: unknown) => {
  const parsed = parseOrBadRequest(
    exchangeParamsSchema,
    params,
    BAD_REQUEST_MESSAGES.invalidExchangeId
  );
  return parsed.exchangeId;
};

export const getExchanges = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  const exchanges = await exchangeService.listForUser(currentUser.sub);
  return res.status(200).json({ exchanges });
});

export const getExchangeDetails = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  const exchangeId = parseExchangeId(req.params);
  const exchange = await exchangeService.getDetails(
    exchangeId,
    currentUser.sub
  );
  return res.status(200).json({ exchange });
});

export const postExchangeMessage = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  const exchangeId = parseExchangeId(req.params);
  const payload = parseOrBadRequest(
    messageSchema,
    req.body,
    BAD_REQUEST_MESSAGES.invalidMessagePayload
  );

  const message = await exchangeService.sendMessage(
    exchangeId,
    currentUser.sub,
    payload.content
  );
  return res.status(201).json({ message });
});

export const completeExchange = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  const exchangeId = parseExchangeId(req.params);
  const exchange = await exchangeService.completeExchange(
    exchangeId,
    currentUser.sub
  );
  return res.status(200).json({ exchange });
});

export const rateExchange = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);
  const exchangeId = parseExchangeId(req.params);
  const payload = parseOrBadRequest(
    createExchangeRatingPayloadSchema,
    req.body,
    BAD_REQUEST_MESSAGES.invalidRatingPayload
  );

  const rating = await exchangeService.rateExchange(
    exchangeId,
    currentUser.sub,
    payload
  );
  return res.status(201).json({ rating });
});
