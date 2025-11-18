import { jest } from '@jest/globals';

const mockFavoriteRepository = {
  listByUserId: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
};

jest.unstable_mockModule('../src/repositories/favoriteRepository.js', () => ({
  favoriteRepository: mockFavoriteRepository,
}));

jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
  userRepository: mockUserRepository,
}));

const { favoriteService } = await import('../src/services/favoriteService.js');

describe('favoriteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('maps favorites to target ids', async () => {
      mockFavoriteRepository.listByUserId.mockResolvedValue([
        { targetUserId: 'a' },
        { targetUserId: 'b' },
      ]);

      const result = await favoriteService.list('user');

      expect(mockFavoriteRepository.listByUserId).toHaveBeenCalledWith('user');
      expect(result).toEqual(['a', 'b']);
    });
  });

  describe('add', () => {
    it('throws when user adds themself', async () => {
      await expect(favoriteService.add('user', 'user')).rejects.toMatchObject({ status: 400 });
    });

    it('throws when target user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(favoriteService.add('user', 'other')).rejects.toMatchObject({ status: 404 });
    });

    it('returns existing favorite', async () => {
      const existing = { id: 'fav' };
      mockUserRepository.findById.mockResolvedValue({ id: 'other' });
      mockFavoriteRepository.find.mockResolvedValue(existing);

      const result = await favoriteService.add('user', 'other');
      expect(result).toBe(existing);
      expect(mockFavoriteRepository.create).not.toHaveBeenCalled();
    });

    it('creates favorite when none exists', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'other' });
      mockFavoriteRepository.find.mockResolvedValue(null);
      mockFavoriteRepository.create.mockResolvedValue({ id: 'fav' });

      const result = await favoriteService.add('user', 'other');
      expect(mockFavoriteRepository.create).toHaveBeenCalledWith('user', 'other');
      expect(result).toEqual({ id: 'fav' });
    });
  });

  describe('remove', () => {
    it('returns null when favorite missing', async () => {
      mockFavoriteRepository.find.mockResolvedValue(null);

      const result = await favoriteService.remove('user', 'other');
      expect(result).toBeNull();
      expect(mockFavoriteRepository.delete).not.toHaveBeenCalled();
    });

    it('deletes favorite when present', async () => {
      const existing = { id: 'fav' };
      mockFavoriteRepository.find.mockResolvedValue(existing);

      const result = await favoriteService.remove('user', 'other');
      expect(mockFavoriteRepository.delete).toHaveBeenCalledWith('user', 'other');
      expect(result).toBe(existing);
    });
  });

  describe('clear', () => {
    it('calls deleteAll', async () => {
      await favoriteService.clear('user');
      expect(mockFavoriteRepository.deleteAll).toHaveBeenCalledWith('user');
    });
  });
});

