import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../src/utils/httpErrors.js';

const mockAdminService = {
  deleteUser: jest.fn<(id: string) => Promise<void>>(),
  updateUserRole:
    jest.fn<
      (
        id: string,
        role: 'user' | 'admin'
      ) => Promise<{ id: string; role: 'user' | 'admin' }>
    >()
};
const mockUserService = {
  listUsersForAdmin: jest.fn<
    (options: {
      page: number;
      pageSize: number;
      search?: string;
      sortBy?: 'createdAt' | 'name' | 'email' | 'role';
      sortDirection?: 'asc' | 'desc';
    }) => Promise<{
      users: Array<{
        id: string;
        name: string;
        email: string;
        role: 'user' | 'admin' | 'owner';
      }>;
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      sortBy: 'createdAt' | 'name' | 'email' | 'role';
      sortDirection: 'asc' | 'desc';
    }>
  >()
};

jest.unstable_mockModule('../src/services/adminService.js', () => ({
  adminService: mockAdminService
}));
jest.unstable_mockModule('../src/services/userService.js', () => ({
  userService: mockUserService
}));

const { deleteUserAccount, updateUserRole, listUsersForOwner } =
  await import('../src/controllers/adminController.js');

const createRes = (): jest.Mocked<Response> => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  } as unknown as jest.Mocked<Response>;
  return res;
};

describe('adminController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteUserAccount', () => {
    it('blocks self-deletion', async () => {
      const req = {
        params: { userId: 'me' },
        user: { sub: 'me' }
      } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;

      await deleteUserAccount(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(mockAdminService.deleteUser).not.toHaveBeenCalled();
    });

    it('delegates to adminService on valid request', async () => {
      const req = {
        params: { userId: 'u1' },
        user: { sub: 'admin' }
      } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;

      await deleteUserAccount(req, res as Response, next);

      expect(mockAdminService.deleteUser).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  describe('updateUserRole', () => {
    it('blocks self role change', async () => {
      const req = {
        params: { userId: 'me' },
        body: { role: 'admin' },
        user: { sub: 'me' }
      } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;

      await updateUserRole(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(mockAdminService.updateUserRole).not.toHaveBeenCalled();
    });

    it('updates role via adminService', async () => {
      const req = {
        params: { userId: 'u2' },
        body: { role: 'admin' },
        user: { sub: 'owner' }
      } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;
      mockAdminService.updateUserRole.mockResolvedValue({
        id: 'u2',
        role: 'admin'
      });

      await updateUserRole(req, res as Response, next);

      expect(mockAdminService.updateUserRole).toHaveBeenCalledWith(
        'u2',
        'admin'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 'u2', role: 'admin' }
      });
    });
  });

  describe('listUsersForOwner', () => {
    it('returns paginated users list with validated query', async () => {
      const req = {
        query: {
          page: '2',
          pageSize: '10',
          search: 'ali',
          sortBy: 'name',
          sortDirection: 'asc'
        }
      } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;

      mockUserService.listUsersForAdmin.mockResolvedValue({
        users: [
          { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'admin' }
        ],
        page: 2,
        pageSize: 10,
        total: 22,
        totalPages: 3,
        sortBy: 'name',
        sortDirection: 'asc'
      });

      await listUsersForOwner(req, res as Response, next);

      expect(mockUserService.listUsersForAdmin).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        search: 'ali',
        sortBy: 'name',
        sortDirection: 'asc'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users: [
          { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'admin' }
        ],
        page: 2,
        pageSize: 10,
        total: 22,
        totalPages: 3,
        sortBy: 'name',
        sortDirection: 'asc'
      });
    });

    it('rejects invalid query params', async () => {
      const req = {
        query: { page: '0', pageSize: '500' }
      } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;

      await listUsersForOwner(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(mockUserService.listUsersForAdmin).not.toHaveBeenCalled();
    });
  });
});
