export const USER_STATUS = {
  active: 'active',
  inactive: 'inactive'
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_STATUSES = Object.values(USER_STATUS) as UserStatus[];

export const isUserStatus = (value: unknown): value is UserStatus =>
  typeof value === 'string' && USER_STATUSES.includes(value as UserStatus);
