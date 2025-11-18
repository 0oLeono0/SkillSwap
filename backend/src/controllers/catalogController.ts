import { asyncHandler } from '../middleware/asyncHandler.js';
import { catalogService } from '../services/catalogService.js';

export const getFiltersBaseData = asyncHandler(async (_req, res) => {
  const data = catalogService.getFiltersBaseData();
  return res.status(200).json(data);
});
