import { request } from '@/shared/api/request';
import type { ApiAuthUser } from './auth';

export interface UsersListResponse {
  users: ApiAuthUser[];
}

export const usersApi = {
  fetchAll() {
    return request<UsersListResponse>('/api/users');
  },
};
