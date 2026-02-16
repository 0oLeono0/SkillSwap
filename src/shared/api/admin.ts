import { authorizedRequest } from '@/shared/api/request';
import type {
  AdminUsersListResponse,
  ApiAdminUser,
  ApiAdminUsersSortBy,
  ApiAdminUsersSortDirection
} from './users';

type AdminUsersQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: ApiAdminUsersSortBy;
  sortDirection?: ApiAdminUsersSortDirection;
};

const adminSortByValues: ApiAdminUsersSortBy[] = [
  'createdAt',
  'name',
  'email',
  'role'
];
const adminSortDirectionValues: ApiAdminUsersSortDirection[] = ['asc', 'desc'];

const buildUsersPath = (query?: AdminUsersQuery) => {
  if (!query) {
    return '/admin/users';
  }

  const params = new URLSearchParams();

  if (Number.isFinite(query.page) && Number(query.page) > 0) {
    params.set('page', String(Math.trunc(Number(query.page))));
  }

  if (Number.isFinite(query.pageSize) && Number(query.pageSize) > 0) {
    params.set('pageSize', String(Math.trunc(Number(query.pageSize))));
  }

  if (typeof query.search === 'string' && query.search.trim().length > 0) {
    params.set('search', query.search.trim());
  }

  if (query.sortBy && adminSortByValues.includes(query.sortBy)) {
    params.set('sortBy', query.sortBy);
  }

  if (
    query.sortDirection &&
    adminSortDirectionValues.includes(query.sortDirection)
  ) {
    params.set('sortDirection', query.sortDirection);
  }

  const queryString = params.toString();
  if (!queryString) {
    return '/admin/users';
  }

  return `/admin/users?${queryString}`;
};

export const adminApi = {
  fetchUsers(accessToken: string, query?: AdminUsersQuery) {
    return authorizedRequest<AdminUsersListResponse>(
      buildUsersPath(query),
      accessToken
    );
  },

  updateUserRole(userId: string, role: 'user' | 'admin', accessToken: string) {
    return authorizedRequest<{ user: ApiAdminUser }>(
      `/admin/users/${userId}/role`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify({ role })
      }
    );
  },

  deleteUser(userId: string, accessToken: string) {
    return authorizedRequest<void>(`/admin/users/${userId}`, accessToken, {
      method: 'DELETE'
    });
  }
};
