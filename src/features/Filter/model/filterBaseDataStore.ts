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

export const loadFiltersBaseData = async (): Promise<FiltersBaseData> => {
  if (cachedBaseData) {
    return cachedBaseData;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = catalogApi
    .fetchFiltersBaseData()
    .then((data) => {
      cachedBaseData = mapResponse(data);
      return cachedBaseData;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
};

export const getCachedFiltersBaseData = (): FiltersBaseData | null => cachedBaseData;
