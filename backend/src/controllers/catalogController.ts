import { asyncHandler } from '../middleware/asyncHandler.js';
import { catalogService } from '../services/catalogService.js';
import { createNotFound } from '../utils/httpErrors.js';

export const getFiltersBaseData = asyncHandler(async (_req, res) => {
  const data = catalogService.getFiltersBaseData();
  return res.status(200).json(data);
});

export const getSkillCategories = asyncHandler(async (_req, res) => {
  const data = catalogService.getSkillCategories();
  return res.status(200).json(data);
});

export const getSkillCategoryById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    throw createNotFound('Skill category not found');
  }

  const category = catalogService.findSkillCategoryById(id);
  if (!category) {
    throw createNotFound('Skill category not found');
  }

  return res.status(200).json(category);
});

export const getCities = asyncHandler(async (_req, res) => {
  const data = catalogService.getCities();
  return res.status(200).json(data);
});

export const getCityById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    throw createNotFound('City not found');
  }

  const city = catalogService.findCityById(id);
  if (!city) {
    throw createNotFound('City not found');
  }

  return res.status(200).json(city);
});
