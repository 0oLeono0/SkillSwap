import { Router } from 'express';
import {
  getCities,
  getCityById,
  getSkillCategories,
  getSkillCategoryById,
} from '../controllers/catalogController.js';

export const referenceRouter = Router();

referenceRouter.get('/skills', getSkillCategories);
referenceRouter.get('/skills/:id', getSkillCategoryById);
referenceRouter.get('/cities', getCities);
referenceRouter.get('/cities/:id', getCityById);
