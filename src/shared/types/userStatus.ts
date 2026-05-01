export const USER_STATUS = {
  active: 'active',
  inactive: 'inactive'
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export type UserStatusFilter = 'all' | UserStatus;
