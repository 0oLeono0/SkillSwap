import {
  catalogApi,
  type ApiCatalogAuthor,
  type ApiCatalogAuthorSkill,
  type CatalogSearchParams as ApiCatalogSearchParams,
  type CatalogSearchResponse as ApiCatalogSearchResponse
} from '@/shared/api/catalog';
import type { RequestOptions } from '@/shared/api/request';

export type CatalogAuthorSkill = ApiCatalogAuthorSkill;

export interface CatalogAuthor extends ApiCatalogAuthor {
  isFavorite?: boolean;
}

export type CatalogSearchParams = ApiCatalogSearchParams;
export type CatalogSearchResponse = ApiCatalogSearchResponse;

export const loadCatalogAuthors = async (
  params: CatalogSearchParams,
  options?: RequestOptions
): Promise<CatalogSearchResponse> => catalogApi.search(params, options);
