import { Router } from 'express';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import { createRequest, getRequests, updateRequestStatus } from '../controllers/requestController.js';

export const requestsRouter = Router();

requestsRouter.use(authenticateAccessToken);
requestsRouter.get('/', getRequests);
requestsRouter.post('/', createRequest);
requestsRouter.patch('/:requestId', updateRequestStatus);
