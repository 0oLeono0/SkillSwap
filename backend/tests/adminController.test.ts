import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../src/utils/httpErrors.js';

const mockAdminService = {
  deleteUser: jest.fn<(id: string) => Promise<void>>(),
  updateUserRole: jest.fn<(id: string, role: 'user' | 'admin') => Promise<{ id: string; role: 'user' | 'admin' }>>(),
};

jest.unstable_mockModule('../src/services/adminService.js', () => ({
  adminService: mockAdminService,
}));

const { deleteUserAccount, updateUserRole } = await import('../src/controllers/adminController.js');

const createRes = (): jest.Mocked<Response> => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as jest.Mocked<Response>;
  return res;
};

describe('adminController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteUserAccount', () => {
    it('blocks self-deletion', async () => {
      const req = { params: { userId: 'me' }, user: { sub: 'me' } } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;

      await deleteUserAccount(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(mockAdminService.deleteUser).not.toHaveBeenCalled();
    });

    it('delegates to adminService on valid request', async () => {
      const req = { params: { userId: 'u1' }, user: { sub: 'admin' } } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;

      await deleteUserAccount(req, res as Response, next);

      expect(mockAdminService.deleteUser).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  describe('updateUserRole', () => {
    it('blocks self role change', async () => {
      const req = { params: { userId: 'me' }, body: { role: 'admin' }, user: { sub: 'me' } } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;

      await updateUserRole(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(mockAdminService.updateUserRole).not.toHaveBeenCalled();
    });

    it('updates role via adminService', async () => {
      const req = { params: { userId: 'u2' }, body: { role: 'admin' }, user: { sub: 'owner' } } as unknown as Request;
      const res = createRes();
      const next = jest.fn() as unknown as NextFunction;
      mockAdminService.updateUserRole.mockResolvedValue({ id: 'u2', role: 'admin' });

      await updateUserRole(req, res as Response, next);

      expect(mockAdminService.updateUserRole).toHaveBeenCalledWith('u2', 'admin');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: { id: 'u2', role: 'admin' } });
    });
  });
});
