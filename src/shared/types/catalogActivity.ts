export const CATALOG_ACTIVITY_PERIOD = {
  default: 'default',
  allTime: 'allTime',
  year: 'year',
  month: 'month',
  week: 'week',
  day: 'day'
} as const;

export type CatalogActivityPeriod =
  | typeof CATALOG_ACTIVITY_PERIOD.allTime
  | typeof CATALOG_ACTIVITY_PERIOD.year
  | typeof CATALOG_ACTIVITY_PERIOD.month
  | typeof CATALOG_ACTIVITY_PERIOD.week
  | typeof CATALOG_ACTIVITY_PERIOD.day;

export type CatalogActivityOption =
  (typeof CATALOG_ACTIVITY_PERIOD)[keyof typeof CATALOG_ACTIVITY_PERIOD];

export const CATALOG_ACTIVITY_LABELS: Record<CatalogActivityOption, string> = {
  default: 'По умолчанию',
  allTime: 'За всё время',
  year: 'За год',
  month: 'За месяц',
  week: 'За неделю',
  day: 'За день'
};

export const isCatalogActivityPeriod = (
  value: unknown
): value is CatalogActivityPeriod =>
  value === CATALOG_ACTIVITY_PERIOD.allTime ||
  value === CATALOG_ACTIVITY_PERIOD.year ||
  value === CATALOG_ACTIVITY_PERIOD.month ||
  value === CATALOG_ACTIVITY_PERIOD.week ||
  value === CATALOG_ACTIVITY_PERIOD.day;
