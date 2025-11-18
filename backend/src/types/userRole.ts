export const USER_ROLES = ['user', 'admin', 'owner'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole);

export const isAssignableAdminRole = (value: unknown): value is Extract<UserRole, 'user' | 'admin'> =>
  value === 'user' || value === 'admin';
