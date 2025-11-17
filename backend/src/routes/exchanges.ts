import { Router } from 'express';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import {
  completeExchange,
  getExchangeDetails,
  getExchanges,
  postExchangeMessage,
} from '../controllers/exchangeController.js';

export const exchangesRouter = Router();

exchangesRouter.use(authenticateAccessToken);
exchangesRouter.get('/', getExchanges);
exchangesRouter.get('/:exchangeId', getExchangeDetails);
exchangesRouter.post('/:exchangeId/messages', postExchangeMessage);
exchangesRouter.post('/:exchangeId/complete', completeExchange);
