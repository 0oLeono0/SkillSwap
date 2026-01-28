export const EXCHANGE_STATUSES = ['active', 'completed'] as const;

export type ExchangeStatus = (typeof EXCHANGE_STATUSES)[number];

export const EXCHANGE_STATUS = {
  active: 'active',
  completed: 'completed'
} as const satisfies Record<ExchangeStatus, ExchangeStatus>;

export const isExchangeStatus = (value: unknown): value is ExchangeStatus =>
  typeof value === 'string' &&
  EXCHANGE_STATUSES.includes(value as ExchangeStatus);
