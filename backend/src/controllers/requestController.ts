import { z } from 'zod';
import { REQUEST_STATUSES } from '../types/requestStatus.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createBadRequest, createUnauthorized } from '../utils/httpErrors.js';
import { requestService } from '../services/requestService.js';

const createRequestSchema = z.object({
  toUserId: z.string().min(1),
  userSkillId: z.string().min(1)
});

const updateStatusSchema = z.object({
  status: z.enum(REQUEST_STATUSES)
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
    throw createBadRequest('Invalid payload', parseResult.error.flatten());
  }

  const request = await requestService.createRequest(
    currentUser.sub,
    parseResult.data.toUserId,
    parseResult.data.userSkillId
  );
  return res.status(201).json({ request });
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw createUnauthorized();
  }

  const parseResult = updateStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw createBadRequest('Invalid payload', parseResult.error.flatten());
  }

  const { requestId } = req.params;
  if (!requestId) {
    throw createBadRequest('Request id is required');
  }

  const request = await requestService.updateStatus(
    requestId,
    currentUser.sub,
    parseResult.data.status
  );
  return res.status(200).json({ request });
});
