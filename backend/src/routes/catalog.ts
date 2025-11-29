import { Router } from 'express';
import {
  getCities,
  getCityById,
  getFiltersBaseData,
  getSkillCategories,
  getSkillCategoryById,
} from '../controllers/catalogController.js';

export const catalogRouter = Router();

catalogRouter.get('/filters', getFiltersBaseData);
catalogRouter.get('/skills', getSkillCategories);
catalogRouter.get('/skills/:id', getSkillCategoryById);
catalogRouter.get('/cities', getCities);
catalogRouter.get('/cities/:id', getCityById);
