import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { HttpError } from '../src/utils/httpErrors.js';

type UserRecord = { id: string; role: string };

const mockUserRepository: {
  findById: jest.MockedFunction<(id: string) => Promise<UserRecord | null>>;
  deleteById: jest.MockedFunction<(id: string) => Promise<void>>;
  updateById: jest.MockedFunction<(id: string, data: Record<string, unknown>) => Promise<UserRecord>>;
} = {
  findById: jest.fn(),
  deleteById: jest.fn(),
  updateById: jest.fn(),
};

const mockSanitizeUser: jest.Mock = jest.fn();

jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
  userRepository: mockUserRepository,
}));

jest.unstable_mockModule('../src/services/userService.js', () => ({
  sanitizeUser: mockSanitizeUser,
}));

const { adminService } = await import('../src/services/adminService.js');

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteUser', () => {
    it('blocks deleting owner account', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'u1', role: 'owner' });

      await expect(adminService.deleteUser('u1')).rejects.toThrow(HttpError);
      expect(mockUserRepository.deleteById).not.toHaveBeenCalled();
    });

    it('deletes regular account', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'u2', role: 'user' });

      await adminService.deleteUser('u2');

      expect(mockUserRepository.deleteById).toHaveBeenCalledWith('u2');
    });
  });

  describe('updateUserRole', () => {
    it('blocks changing owner role', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'u1', role: 'owner' });

      await expect(adminService.updateUserRole('u1', 'admin')).rejects.toThrow(HttpError);
      expect(mockUserRepository.updateById).not.toHaveBeenCalled();
    });

    it('returns sanitized user when role unchanged', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'u2', role: 'user' });
      mockSanitizeUser.mockReturnValue({ id: 'u2', role: 'user' });

      const result = await adminService.updateUserRole('u2', 'user');

      expect(mockUserRepository.updateById).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'u2', role: 'user' });
    });
  });
});
