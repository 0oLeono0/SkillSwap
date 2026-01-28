export const REQUEST_STATUSES = ['pending', 'accepted', 'rejected'] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  rejected: 'rejected'
} as const satisfies Record<RequestStatus, RequestStatus>;

export const isRequestStatus = (value: unknown): value is RequestStatus =>
  typeof value === 'string' &&
  REQUEST_STATUSES.includes(value as RequestStatus);
