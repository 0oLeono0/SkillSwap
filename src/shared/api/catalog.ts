import { request } from '@/shared/api/request';

export interface CatalogFilterBaseData {
  cities: Array<{ id: number; name: string }>;
  skillGroups: Array<{
    id: number;
    name: string;
    skills: Array<{ id: number; name: string }>;
  }>;
}

export const catalogApi = {
  fetchFiltersBaseData() {
    return request<CatalogFilterBaseData>('/catalog/filters');
  },
};
