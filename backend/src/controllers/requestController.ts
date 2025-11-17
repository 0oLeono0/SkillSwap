import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createBadRequest, createUnauthorized } from '../utils/httpErrors.js';
import { requestService } from '../services/requestService.js';

const createRequestSchema = z.object({
  toUserId: z.string().min(1),
  skillId: z.string().min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']),
});

export const getRequests = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw createUnauthorized();
  }

  const data = await requestService.listForUser(currentUser.sub);
  return res.status(200).json(data);
});

export const createRequest = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw createUnauthorized();
  }

  const parseResult = createRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Некорректные данные', details: parseResult.error.flatten() });
  }

  const request = await requestService.createRequest(currentUser.sub, parseResult.data.toUserId, parseResult.data.skillId);
  return res.status(201).json({ request });
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw createUnauthorized();
  }

  const parseResult = updateStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Некорректные данные', details: parseResult.error.flatten() });
  }

  const { requestId } = req.params;
  if (!requestId) {
    throw createBadRequest('Идентификатор заявки обязателен');
  }

  const request = await requestService.updateStatus(requestId, currentUser.sub, parseResult.data.status);
  return res.status(200).json({ request });
});
