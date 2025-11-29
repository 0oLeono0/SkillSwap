import { request } from '@/shared/api/request';
import type { ApiAuthUser } from './auth';

export type ApiCatalogUser = Omit<ApiAuthUser, 'email'>;

export interface UsersListResponse {
  users: ApiCatalogUser[];
}

export interface AdminUsersListResponse {
  users: ApiAuthUser[];
}

export const usersApi = {
  fetchAll() {
    return request<UsersListResponse>('/users/public');
  },
};
