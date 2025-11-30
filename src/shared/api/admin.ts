import { authorizedRequest } from '@/shared/api/request';
import type { ApiAuthUser } from './auth';
import type { AdminUsersListResponse } from './users';

export const adminApi = {
  fetchUsers(accessToken: string) {
    return authorizedRequest<AdminUsersListResponse>('/admin/users', accessToken);
  },

  updateUserRole(userId: string, role: 'user' | 'admin', accessToken: string) {
    return authorizedRequest<{ user: ApiAuthUser }>(`/admin/users/${userId}/role`, accessToken, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  deleteUser(userId: string, accessToken: string) {
    return authorizedRequest<void>(`/admin/users/${userId}`, accessToken, {
      method: 'DELETE',
    });
  },
};
