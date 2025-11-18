import { Router } from 'express';
import { getFiltersBaseData } from '../controllers/catalogController.js';

export const catalogRouter = Router();

catalogRouter.get('/filters', getFiltersBaseData);
