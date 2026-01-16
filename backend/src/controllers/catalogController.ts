import { asyncHandler } from '../middleware/asyncHandler.js';
import { catalogService } from '../services/catalogService.js';
import { createNotFound } from '../utils/httpErrors.js';

const parseStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((entry) =>
      typeof entry === 'string' ? entry.split(',') : []
    );
  }
  if (typeof value === 'string') {
    return value.split(',');
  }
  return [];
};

const parseNumberList = (value: unknown): number[] =>
  parseStringList(value)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry));

const parsePositiveNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const allowedModes = new Set(['all', 'wantToLearn', 'canTeach']);

export const getFiltersBaseData = asyncHandler(async (_req, res) => {
  const data = await catalogService.getFiltersBaseData();
  return res.status(200).json(data);
});

export const getSkillCategories = asyncHandler(async (_req, res) => {
  const data = await catalogService.getSkillCategories();
  return res.status(200).json(data);
});

export const getSkillCategoryById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    throw createNotFound('Skill category not found');
  }

  const category = await catalogService.findSkillCategoryById(id);
  if (!category) {
    throw createNotFound('Skill category not found');
  }

  return res.status(200).json(category);
});

export const getCities = asyncHandler(async (_req, res) => {
  const data = await catalogService.getCities();
  return res.status(200).json(data);
});

export const searchCatalogSkills = asyncHandler(async (req, res) => {
  const mode =
    typeof req.query.mode === 'string' && allowedModes.has(req.query.mode)
      ? (req.query.mode as 'all' | 'wantToLearn' | 'canTeach')
      : undefined;

  const gender =
    typeof req.query.gender === 'string' ? req.query.gender : undefined;
  const search =
    typeof req.query.search === 'string' ? req.query.search : undefined;
  const excludeAuthorId =
    typeof req.query.excludeAuthorId === 'string'
      ? req.query.excludeAuthorId
      : undefined;

  const cityIds = parseNumberList(req.query.cityIds);
  const skillIds = parseNumberList(req.query.skillIds);
  const categoryIds = parseNumberList(req.query.categoryIds);
  const authorIds = parseStringList(req.query.authorIds)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const page = parsePositiveNumber(req.query.page);
  const pageSize = parsePositiveNumber(req.query.pageSize);

  const options: Parameters<typeof catalogService.searchCatalogSkills>[0] = {
    cityIds,
    skillIds,
    categoryIds,
    authorIds
  };

  if (mode) {
    options.mode = mode;
  }
  if (gender) {
    options.gender = gender;
  }
  if (search) {
    options.search = search;
  }
  if (excludeAuthorId) {
    options.excludeAuthorId = excludeAuthorId;
  }
  if (typeof page === 'number') {
    options.page = page;
  }
  if (typeof pageSize === 'number') {
    options.pageSize = pageSize;
  }

  const data = await catalogService.searchCatalogSkills(options);

  return res.status(200).json(data);
});

export const getCityById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    throw createNotFound('City not found');
  }

  const city = await catalogService.findCityById(id);
  if (!city) {
    throw createNotFound('City not found');
  }

  return res.status(200).json(city);
});
