import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockUserRepository: {
  findPublicById: jest.MockedFunction<(userId: string) => Promise<unknown>>;
} = {
  findPublicById: jest.fn()
};

const mockExchangeRepository: {
  listRatingsForUser: jest.MockedFunction<
    (ratedUserId: string) => Promise<unknown>
  >;
  getAverageRatingForUser: jest.MockedFunction<
    (ratedUserId: string) => Promise<unknown>
  >;
} = {
  listRatingsForUser: jest.fn(),
  getAverageRatingForUser: jest.fn()
};

jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
  userRepository: mockUserRepository
}));

jest.unstable_mockModule('../src/repositories/exchangeRepository.js', () => ({
  exchangeRepository: mockExchangeRepository
}));

const { userService } = await import('../src/services/userService.js');

describe('userService.getUserRatings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns average rating and public rating list for existing user', async () => {
    mockUserRepository.findPublicById.mockResolvedValue({ id: 'user-1' });
    mockExchangeRepository.getAverageRatingForUser.mockResolvedValue({
      _avg: { score: 4.5 },
      _count: { score: 2 }
    });
    mockExchangeRepository.listRatingsForUser.mockResolvedValue([
      {
        id: 'rating-1',
        exchangeId: 'exchange-1',
        score: 5,
        comment: 'Отличный обмен',
        createdAt: new Date('2026-04-30T00:00:00.000Z'),
        updatedAt: new Date('2026-04-30T00:00:00.000Z'),
        rater: {
          id: 'rater-1',
          name: 'Автор оценки',
          avatarUrl: '',
          email: 'hidden@example.com',
          passwordHash: 'secret',
          role: 'admin'
        }
      }
    ]);

    const result = await userService.getUserRatings('user-1');

    expect(mockUserRepository.findPublicById).toHaveBeenCalledWith('user-1');
    expect(mockExchangeRepository.listRatingsForUser).toHaveBeenCalledWith(
      'user-1'
    );
    expect(mockExchangeRepository.getAverageRatingForUser).toHaveBeenCalledWith(
      'user-1'
    );
    expect(result).toEqual({
      averageRating: 4.5,
      ratingsCount: 2,
      ratings: [
        {
          id: 'rating-1',
          exchangeId: 'exchange-1',
          score: 5,
          comment: 'Отличный обмен',
          rater: {
            id: 'rater-1',
            name: 'Автор оценки',
            avatarUrl: null
          },
          createdAt: '2026-04-30T00:00:00.000Z',
          updatedAt: '2026-04-30T00:00:00.000Z'
        }
      ]
    });
    expect(result.ratings[0]?.rater).not.toHaveProperty('email');
    expect(result.ratings[0]?.rater).not.toHaveProperty('passwordHash');
    expect(result.ratings[0]?.rater).not.toHaveProperty('role');
  });

  it('returns empty rating state when user has no ratings', async () => {
    mockUserRepository.findPublicById.mockResolvedValue({ id: 'user-1' });
    mockExchangeRepository.getAverageRatingForUser.mockResolvedValue({
      _avg: { score: null },
      _count: { score: 0 }
    });
    mockExchangeRepository.listRatingsForUser.mockResolvedValue([]);

    await expect(userService.getUserRatings('user-1')).resolves.toEqual({
      averageRating: null,
      ratingsCount: 0,
      ratings: []
    });
  });

  it('throws 404 when user is missing', async () => {
    mockUserRepository.findPublicById.mockResolvedValue(null);

    await expect(
      userService.getUserRatings('missing-user')
    ).rejects.toMatchObject({ status: 404 });

    expect(mockExchangeRepository.listRatingsForUser).not.toHaveBeenCalled();
    expect(
      mockExchangeRepository.getAverageRatingForUser
    ).not.toHaveBeenCalled();
  });
});
