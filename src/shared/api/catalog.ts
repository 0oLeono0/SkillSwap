import { request, type RequestOptions } from '@/shared/api/request';

export interface CatalogFilterBaseData {
  cities: Array<{ id: number; name: string }>;
  skillGroups: Array<{
    id: number;
    name: string;
    skills: Array<{ id: number; name: string }>;
  }>;
}

export interface ApiCatalogSkill {
  id: string;
  title: string;
  description: string;
  type: 'teach' | 'learn';
  category: string;
  categoryId: number | null;
  imageUrl?: string;
  imageUrls?: string[];
  authorAvatarUrl?: string;
  tags: string[];
  authorId: string;
  isFavorite?: boolean;
  originalSkillId: number;
  userSkillId: string;
  authorName: string;
  authorCity: string;
  authorAge: number;
  authorAbout?: string;
}

export interface CatalogSearchResponse {
  skills: ApiCatalogSkill[];
  page: number;
  pageSize: number;
  totalAuthors: number;
}

export interface CatalogSearchParams {
  mode?: 'all' | 'wantToLearn' | 'canTeach';
  gender?: string;
  cityIds?: number[];
  skillIds?: number[];
  categoryIds?: number[];
  authorIds?: string[];
  excludeAuthorId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

const appendList = (
  params: URLSearchParams,
  key: string,
  values?: Array<string | number>
) => {
  if (!values || values.length === 0) return;
  const payload = values
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
  if (payload.length > 0) {
    params.set(key, payload.join(','));
  }
};

const buildCatalogSearchQuery = (params: CatalogSearchParams): string => {
  const query = new URLSearchParams();

  if (params.mode) {
    query.set('mode', params.mode);
  }
  if (params.gender) {
    query.set('gender', params.gender);
  }
  if (params.search) {
    query.set('search', params.search);
  }
  if (typeof params.excludeAuthorId === 'string') {
    query.set('excludeAuthorId', params.excludeAuthorId);
  }
  if (typeof params.page === 'number') {
    query.set('page', String(params.page));
  }
  if (typeof params.pageSize === 'number') {
    query.set('pageSize', String(params.pageSize));
  }

  appendList(query, 'cityIds', params.cityIds);
  appendList(query, 'skillIds', params.skillIds);
  appendList(query, 'categoryIds', params.categoryIds);
  appendList(query, 'authorIds', params.authorIds);

  return query.toString();
};

export const catalogApi = {
  fetchFiltersBaseData() {
    return request<CatalogFilterBaseData>('/catalog/filters');
  },

  search(params: CatalogSearchParams, options?: RequestOptions) {
    const query = buildCatalogSearchQuery(params);
    const path = query.length ? `/catalog/search?${query}` : '/catalog/search';
    return request<CatalogSearchResponse>(path, options);
  }
};
