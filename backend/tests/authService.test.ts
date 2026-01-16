import crypto from 'node:crypto';
import { jest } from '@jest/globals';
import type { Prisma } from '@prisma/client';
import { hashToken } from '../src/utils/tokenHash.js';

type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash?: string;
};

type RefreshTokenRecord = {
  id: string;
  token: string;
  expiresAt: Date;
};

const mockUserRepository: {
  findByEmail: jest.MockedFunction<
    (email: string) => Promise<UserRecord | null>
  >;
  create: jest.MockedFunction<
    (data: Prisma.UserCreateInput) => Promise<UserRecord>
  >;
  saveRefreshToken: jest.MockedFunction<
    (
      id: string,
      userId: string,
      tokenHash: string,
      expiresAt: Date
    ) => Promise<void>
  >;
  findById: jest.MockedFunction<(id: string) => Promise<UserRecord | null>>;
  findRefreshToken: jest.MockedFunction<
    (id: string) => Promise<RefreshTokenRecord | null>
  >;
  deleteRefreshTokenById: jest.MockedFunction<(id: string) => Promise<void>>;
  deleteRefreshTokenByToken: jest.MockedFunction<
    (token: string) => Promise<void>
  >;
  updateById: jest.MockedFunction<
    (id: string, data: Prisma.UserUpdateInput) => Promise<UserRecord>
  >;
} = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  saveRefreshToken: jest.fn(),
  findById: jest.fn(),
  findRefreshToken: jest.fn(),
  deleteRefreshTokenById: jest.fn(),
  deleteRefreshTokenByToken: jest.fn(),
  updateById: jest.fn()
};

const mockUserSkillRepository: {
  createMany: jest.MockedFunction<
    (data: Prisma.UserSkillCreateManyInput[]) => Promise<{ count: number }>
  >;
  deleteByUserAndType: jest.MockedFunction<
    (userId: string, type: string) => Promise<{ count: number }>
  >;
} = {
  createMany: jest.fn(),
  deleteByUserAndType: jest.fn()
};

const mockTokenService = {
  createAccessToken: jest.fn(() => 'access-token'),
  createRefreshToken: jest.fn(() => ({
    token: 'refresh-token',
    expiresAt: new Date('2099-01-01')
  })),
  verifyRefreshToken: jest.fn(() => ({
    sub: 'user-id',
    tokenId: 'token-id'
  }))
};

const mockHashPassword: jest.MockedFunction<
  (password: string) => Promise<string>
> = jest.fn(async () => 'hashed');
const mockVerifyPassword: jest.MockedFunction<
  (password: string, passwordHash: string) => Promise<boolean>
> = jest.fn(async () => true);

jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
  userRepository: mockUserRepository
}));

jest.unstable_mockModule('../src/repositories/userSkillRepository.js', () => ({
  userSkillRepository: mockUserSkillRepository
}));

jest.unstable_mockModule('../src/services/tokenService.js', () => ({
  tokenService: mockTokenService
}));

jest.unstable_mockModule('../src/utils/password.js', () => ({
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword
}));

jest.unstable_mockModule('../src/services/userService.js', () => ({
  sanitizeUser: (value: unknown) => value
}));

const { authService } = await import('../src/services/authService.js');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates user, normalizes skills and issues tokens', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: 'user'
      });
      mockUserRepository.findById.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: 'user'
      });

      const result = await authService.register({
        email: 'user@example.com',
        password: 'pass123',
        name: 'User',
        teachableSkills: [{ id: '1', title: ' Skill ', description: ' Desc ' }],
        learningSkills: [1]
      });

      const payload = mockUserRepository.create.mock.calls[0][0];
      expect(payload.email).toBe('user@example.com');
      expect(mockUserSkillRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: 'user-1',
            type: 'teach',
            title: 'Skill',
            description: 'Desc',
            categoryId: null,
            subcategoryId: null,
            imageUrls: '[]'
          }),
          expect.objectContaining({
            userId: 'user-1',
            type: 'learn',
            title: '',
            description: '',
            subcategoryId: 1,
            imageUrls: '[]'
          })
        ])
      );
      expect(result).toMatchObject({
        user: expect.objectContaining({ email: 'user@example.com' }),
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });
    });

    it('throws when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing',
        email: 'existing@example.com',
        name: 'Existing',
        role: 'user'
      });

      await expect(
        authService.register({
          email: 'duplicate@example.com',
          password: '123',
          name: 'User'
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('validates credentials and returns tokens', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user',
        email: 'user@example.com',
        name: 'User',
        role: 'user',
        passwordHash: 'hashed'
      });
      mockVerifyPassword.mockResolvedValue(true);

      const result = await authService.login({
        email: 'user@example.com',
        password: 'secret'
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('throws when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(
        authService.login({ email: 'missing@example.com', password: 'secret' })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('issueTokens', () => {
    it('persists refresh token with generated jti', async () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('123e4567-e89b-12d3-a456-426614174000');

      await authService.issueTokens({
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: 'user'
      });

      expect(mockUserRepository.saveRefreshToken).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        'user-1',
        hashToken('refresh-token'),
        expect.any(Date)
      );

      (
        crypto.randomUUID as jest.MockedFunction<typeof crypto.randomUUID>
      ).mockRestore?.();
    });
  });

  describe('refreshSession', () => {
    it('verifies refresh token and issues new tokens', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue({
        sub: 'user-id',
        tokenId: 'token-id'
      });
      mockUserRepository.findById.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        name: 'User',
        role: 'user'
      });
      mockUserRepository.findRefreshToken.mockResolvedValue({
        token: 'refresh-token',
        expiresAt: new Date('2999-01-01'),
        id: 'token-id'
      });

      await authService.refreshSession('refresh-token');

      expect(mockUserRepository.deleteRefreshTokenById).toHaveBeenCalledWith(
        'token-id'
      );
      expect(mockUserRepository.saveRefreshToken).toHaveBeenCalled();
    });

    it('rejects expired refresh token and cleans it up', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue({
        sub: 'user-id',
        tokenId: 'token-id'
      });
      mockUserRepository.findById.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        name: 'User',
        role: 'user'
      });
      mockUserRepository.findRefreshToken.mockResolvedValue({
        token: 'refresh-token',
        expiresAt: new Date('2000-01-01'),
        id: 'token-id'
      });

      await expect(authService.refreshSession('refresh-token')).rejects.toThrow(
        'Unauthorized'
      );
      expect(mockUserRepository.deleteRefreshTokenById).toHaveBeenCalledWith(
        'token-id'
      );
    });
  });

  describe('updateProfile', () => {
    it('updates profile fields and normalizes skill payloads', async () => {
      mockUserRepository.findById
        .mockResolvedValueOnce({
          id: 'user',
          email: 'user@example.com',
          name: 'User',
          role: 'user'
        })
        .mockResolvedValueOnce({
          id: 'user',
          email: 'new@example.com',
          name: 'User',
          role: 'user'
        });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.updateById.mockResolvedValue({
        id: 'user',
        email: 'new@example.com',
        name: 'User',
        role: 'user'
      });

      const result = await authService.updateProfile('user', {
        email: 'new@example.com',
        name: 'New Name',
        gender: 'Мужской',
        teachableSkills: [
          { id: 'skill', title: '  Dev ', description: '  JS ' }
        ]
      });

      const updatePayload = mockUserRepository.updateById.mock.calls[0][1];
      expect(updatePayload.email).toBe('new@example.com');
      expect(updatePayload.name).toBe('New Name');
      expect(updatePayload.gender).toBe('Мужской');
      expect(mockUserSkillRepository.deleteByUserAndType).toHaveBeenCalledWith(
        'user',
        'teach'
      );
      expect(mockUserSkillRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: 'user',
            type: 'teach',
            title: 'Dev',
            description: 'JS',
            categoryId: null,
            subcategoryId: null,
            imageUrls: '[]'
          })
        ])
      );
      expect(result).not.toBeNull();
      if (!result) {
        throw new Error('Expected updated user');
      }
      expect(result.email).toBe('new@example.com');
    });
  });
});
