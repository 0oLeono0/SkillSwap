import { request } from '@/shared/api/request';
import type { ApiAuthUser } from './auth';
import type { UserRole } from '@/shared/types/userRole';

export type ApiCatalogUser = Omit<ApiAuthUser, 'email'>;

export interface ApiAdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type ApiAdminUsersSortBy = 'createdAt' | 'name' | 'email' | 'role';
export type ApiAdminUsersSortDirection = 'asc' | 'desc';

export interface UsersListResponse {
  users: ApiCatalogUser[];
}

export interface AdminUsersListResponse {
  users: ApiAdminUser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy: ApiAdminUsersSortBy;
  sortDirection: ApiAdminUsersSortDirection;
}

export const usersApi = {
  fetchAll() {
    return request<UsersListResponse>('/users/public');
  }
};
