import { z } from 'zod';
import { REQUEST_STATUSES } from '../types/requestStatus.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BAD_REQUEST_MESSAGES } from '../utils/errorMessages.js';
import { requireCurrentUser } from '../utils/currentUser.js';
import { requireStringParam } from '../utils/routeParams.js';
import { parseOrBadRequest } from '../utils/validation.js';
import { requestService } from '../services/requestService.js';

const createRequestSchema = z.object({
  toUserId: z.string().min(1),
  userSkillId: z.string().min(1)
});

const updateStatusSchema = z.object({
  status: z.enum(REQUEST_STATUSES)
});

export const getRequests = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);

  const data = await requestService.listForUser(currentUser.sub);
  return res.status(200).json(data);
});

export const createRequest = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);

  const payload = parseOrBadRequest(createRequestSchema, req.body);

  const request = await requestService.createRequest(
    currentUser.sub,
    payload.toUserId,
    payload.userSkillId
  );
  return res.status(201).json({ request });
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const currentUser = requireCurrentUser(req);

  const payload = parseOrBadRequest(updateStatusSchema, req.body);

  const requestId = requireStringParam(
    req.params,
    'requestId',
    BAD_REQUEST_MESSAGES.requestIdRequired
  );

  const request = await requestService.updateStatus(
    requestId,
    currentUser.sub,
    payload.status
  );
  return res.status(200).json({ request });
});
