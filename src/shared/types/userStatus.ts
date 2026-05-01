export const USER_STATUS = {
  active: 'active',
  inactive: 'inactive'
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export type UserStatusFilter = 'all' | UserStatus;

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Активен',
  inactive: 'Неактивен'
};

export const isUserStatus = (value: unknown): value is UserStatus =>
  value === USER_STATUS.active || value === USER_STATUS.inactive;

export const normalizeUserStatus = (value: unknown): UserStatus =>
  isUserStatus(value) ? value : USER_STATUS.active;
