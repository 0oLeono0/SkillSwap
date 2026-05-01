export const CATALOG_SORT = {
  default: 'default',
  rating: 'rating'
} as const;

export type CatalogSortBy = typeof CATALOG_SORT.rating;
export type CatalogSortOption =
  (typeof CATALOG_SORT)[keyof typeof CATALOG_SORT];

export const CATALOG_SORT_LABELS: Record<CatalogSortOption, string> = {
  default: 'По умолчанию',
  rating: 'По рейтингу'
};

export const isCatalogSortBy = (value: unknown): value is CatalogSortBy =>
  value === CATALOG_SORT.rating;
