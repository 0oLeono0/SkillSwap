export const USER_ROLE = {
  user: 'user',
  admin: 'admin',
  owner: 'owner'
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLES = Object.values(USER_ROLE) as UserRole[];

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole);

export const isAssignableAdminRole = (
  value: unknown
): value is Extract<UserRole, 'user' | 'admin'> =>
  value === USER_ROLE.user || value === USER_ROLE.admin;
