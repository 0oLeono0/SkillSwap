import { catalogApi } from '@/shared/api/catalog';
import type { CityOption, SkillCategories } from '../types';

export interface FiltersBaseData {
  cities: CityOption[];
  skillGroups: SkillCategories[];
}

let cachedBaseData: FiltersBaseData | null = null;
let pendingRequest: Promise<FiltersBaseData> | null = null;

const mapResponse = (data: FiltersBaseData): FiltersBaseData => ({
  cities: data.cities ?? [],
  skillGroups: data.skillGroups ?? [],
});

export const resetFiltersBaseDataCache = () => {
  cachedBaseData = null;
  pendingRequest = null;
};

interface LoadOptions {
  force?: boolean;
}

export const loadFiltersBaseData = async ({ force = false }: LoadOptions = {}): Promise<FiltersBaseData> => {
  if (cachedBaseData && !force) {
    return cachedBaseData;
  }

  if (pendingRequest && !force) {
    return pendingRequest;
  }

  const request = catalogApi
    .fetchFiltersBaseData()
    .then((data) => {
      cachedBaseData = mapResponse(data);
      return cachedBaseData;
    })
    .catch((error) => {
      console.warn('[filterBaseDataStore] Failed to load filters base data, using fallback', error);
      cachedBaseData = { cities: [], skillGroups: [] };
      return cachedBaseData;
    });

  pendingRequest = request;

  try {
    return await request;
  } finally {
    if (pendingRequest === request) {
      pendingRequest = null;
    }
  }

};

export const getCachedFiltersBaseData = (): FiltersBaseData | null => cachedBaseData;
