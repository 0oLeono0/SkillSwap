export const USER_ROLES = ['user', 'admin', 'owner'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const isElevatedRole = (role?: UserRole | null): boolean =>
  role === 'admin' || role === 'owner';
