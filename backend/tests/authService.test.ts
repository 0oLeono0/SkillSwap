import crypto from 'node:crypto';
import { jest } from '@jest/globals';
import { hashToken } from '../src/utils/tokenHash.js';

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  saveRefreshToken: jest.fn(),
  findById: jest.fn(),
  findRefreshToken: jest.fn(),
  deleteRefreshTokenById: jest.fn(),
  deleteRefreshTokenByToken: jest.fn(),
  updateById: jest.fn(),
};

const mockTokenService = {
  createAccessToken: jest.fn(() => 'access-token'),
  createRefreshToken: jest.fn(() => ({ token: 'refresh-token', expiresAt: new Date('2099-01-01') })),
  verifyRefreshToken: jest.fn(() => ({
    sub: 'user-id',
    tokenId: 'token-id',
  })),
};

const mockHashPassword = jest.fn(() => 'hashed');
const mockVerifyPassword = jest.fn(() => true);

jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
  userRepository: mockUserRepository,
}));

jest.unstable_mockModule('../src/services/tokenService.js', () => ({
  tokenService: mockTokenService,
}));

jest.unstable_mockModule('../src/utils/password.js', () => ({
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
}));

jest.unstable_mockModule('../src/services/userService.js', () => ({
  sanitizeUser: (value: unknown) => value,
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
        role: 'user',
      });

      const result = await authService.register({
        email: 'user@example.com',
        password: 'pass123',
        name: 'User',
        teachableSkills: [{ id: '1', title: ' Skill ', description: ' Desc ' }],
        learningSkills: [1],
      });

      const payload = mockUserRepository.create.mock.calls[0][0];
      expect(payload.email).toBe('user@example.com');
      expect(JSON.parse(payload.teachableSkills)).toEqual([
        {
          id: '1',
          title: 'Skill',
          description: 'Desc',
          categoryId: null,
          subcategoryId: null,
          imageUrls: [],
        },
      ]);
      expect(JSON.parse(payload.learningSkills)).toHaveLength(1);
      expect(result).toMatchObject({
        user: expect.objectContaining({ email: 'user@example.com' }),
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('throws when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(
        authService.register({ email: 'duplicate@example.com', password: '123', name: 'User' }),
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
        passwordHash: 'hashed',
      });
      mockVerifyPassword.mockResolvedValue(true);

      const result = await authService.login({ email: 'user@example.com', password: 'secret' });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('throws when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(authService.login({ email: 'missing@example.com', password: 'secret' })).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('issueTokens', () => {
    it('persists refresh token with generated jti', async () => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValue('jti-123');

      await authService.issueTokens({
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: 'user',
      });

      expect(mockUserRepository.saveRefreshToken).toHaveBeenCalledWith('jti-123', 'user-1', hashToken('refresh-token'), expect.any(Date));

      (crypto.randomUUID as jest.MockedFunction<typeof crypto.randomUUID>).mockRestore?.();
    });
  });

  describe('refreshSession', () => {
    it('verifies refresh token and issues new tokens', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue({
        sub: 'user-id',
        tokenId: 'token-id',
      });
      mockUserRepository.findById.mockResolvedValue({ id: 'user-id', email: 'user@example.com', name: 'User', role: 'user' });
      mockUserRepository.findRefreshToken.mockResolvedValue({ token: 'refresh-token' });

      await authService.refreshSession('refresh-token');

      expect(mockUserRepository.deleteRefreshTokenById).toHaveBeenCalledWith('token-id');
      expect(mockUserRepository.saveRefreshToken).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('updates profile fields and normalizes skill payloads', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: 'user',
        email: 'user@example.com',
      });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.updateById.mockResolvedValue({ id: 'user', email: 'new@example.com' });

      const result = await authService.updateProfile('user', {
        email: 'new@example.com',
        name: 'New Name',
        gender: 'Мужской',
        teachableSkills: [{ id: 'skill', title: '  Dev ', description: '  JS ' }],
      });

      const updatePayload = mockUserRepository.updateById.mock.calls[0][1];
      expect(updatePayload.email).toBe('new@example.com');
      expect(updatePayload.name).toBe('New Name');
      expect(updatePayload.gender).toBe('Мужской');
      expect(JSON.parse(updatePayload.teachableSkills)).toEqual([
        { id: 'skill', title: 'Dev', description: 'JS', categoryId: null, subcategoryId: null, imageUrls: [] },
      ]);
      expect(result.email).toBe('new@example.com');
    });
  });
});
