import { request } from '@/shared/api/request';
import type { ApiAuthUser } from './auth';
import type { UsersListResponse } from './users';

export const adminApi = {
  fetchUsers(accessToken: string) {
    return request<UsersListResponse>('/api/admin/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  updateUserRole(userId: string, role: 'user' | 'admin', accessToken: string) {
    return request<{ user: ApiAuthUser }>(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ role }),
    });
  },

  deleteUser(userId: string, accessToken: string) {
    return request<void>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
