import { act, renderHook, waitFor } from '@testing-library/react';
import type { UserRatingsResponse } from '@skillswap/contracts/ratings';
import { usersApi } from '@/shared/api/users';
import { useUserRatings } from './useUserRatings';

jest.mock('@/shared/api/users', () => ({
  usersApi: {
    getRatings: jest.fn()
  }
}));

const mockGetRatings = usersApi.getRatings as jest.MockedFunction<
  typeof usersApi.getRatings
>;

const createRatingsResponse = (
  overrides: Partial<UserRatingsResponse> = {}
): UserRatingsResponse => ({
  averageRating:
    'averageRating' in overrides ? (overrides.averageRating ?? null) : 4.5,
  ratingsCount: overrides.ratingsCount ?? 1,
  ratings: overrides.ratings ?? [
    {
      id: 'rating-1',
      exchangeId: 'exchange-1',
      score: 5,
      comment: 'Отличный обмен',
      rater: {
        id: 'user-2',
        name: 'Автор оценки',
        avatarUrl: null
      },
      createdAt: '2026-04-30T00:00:00.000Z',
      updatedAt: '2026-04-30T00:00:00.000Z'
    }
  ]
});

describe('useUserRatings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads ratings for provided user id', async () => {
    const response = createRatingsResponse();
    mockGetRatings.mockResolvedValue(response);

    const { result } = renderHook(() => useUserRatings('user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.ratingsCount).toBe(1);
    });

    expect(mockGetRatings).toHaveBeenCalledWith('user-1');
    expect(result.current.averageRating).toBe(4.5);
    expect(result.current.ratings).toEqual(response.ratings);
    expect(result.current.error).toBeNull();
  });

  it('does not request ratings without user id', () => {
    const { result } = renderHook(() => useUserRatings('   '));

    expect(mockGetRatings).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      ratings: [],
      averageRating: null,
      ratingsCount: 0,
      isLoading: false,
      error: null
    });
  });

  it('returns empty state when user has no ratings', async () => {
    mockGetRatings.mockResolvedValue(
      createRatingsResponse({
        averageRating: null,
        ratingsCount: 0,
        ratings: []
      })
    );

    const { result } = renderHook(() => useUserRatings('user-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.ratingsCount).toBe(0);
    });

    expect(result.current.averageRating).toBeNull();
    expect(result.current.ratings).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('sets generic error when loading fails', async () => {
    mockGetRatings.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserRatings('user-1'));

    await waitFor(() => {
      expect(result.current.error).toBe(
        'Не удалось загрузить рейтинг пользователя'
      );
    });

    expect(result.current.ratings).toEqual([]);
    expect(result.current.averageRating).toBeNull();
    expect(result.current.ratingsCount).toBe(0);
  });

  it('sets not found error separately', async () => {
    mockGetRatings.mockRejectedValue({ status: 404 });

    const { result } = renderHook(() => useUserRatings('missing-user'));

    await waitFor(() => {
      expect(result.current.error).toBe('Пользователь не найден');
    });
  });

  it('refetch reloads ratings', async () => {
    mockGetRatings
      .mockResolvedValueOnce(createRatingsResponse({ averageRating: 3 }))
      .mockResolvedValueOnce(createRatingsResponse({ averageRating: 5 }));

    const { result } = renderHook(() => useUserRatings('user-1'));

    await waitFor(() => {
      expect(result.current.averageRating).toBe(3);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetRatings).toHaveBeenCalledTimes(2);
    expect(result.current.averageRating).toBe(5);
  });
});
