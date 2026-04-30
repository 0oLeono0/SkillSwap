import type { UserRatingsResponse } from '@skillswap/contracts/ratings';
import { apiBaseUrl } from '@/shared/config/env';
import { usersApi } from './users';

type CapturedRequestInit = {
  method?: string;
  headers?: Headers;
};

describe('usersApi', () => {
  const originalFetch = globalThis.fetch;

  const createFetchResponse = <T>(
    payload: T,
    status = 200,
    ok = true,
    contentType = 'application/json'
  ) =>
    ({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      headers: new Headers({ 'Content-Type': contentType }),
      json: async () => payload,
      text: async () =>
        typeof payload === 'string' ? payload : JSON.stringify(payload)
    }) as Response;

  const mockFetch = (payload: unknown = {}, status = 200, ok = true) => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(createFetchResponse(payload, status, ok));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  };

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('gets public user ratings without auth header', async () => {
    const payload: UserRatingsResponse = {
      averageRating: 4.5,
      ratingsCount: 2,
      ratings: [
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
    };
    const fetchMock = mockFetch(payload);

    const result = await usersApi.getRatings('user-1');

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const requestInit = init as CapturedRequestInit | undefined;

    expect(url).toBe(`${apiBaseUrl}/users/user-1/ratings`);
    expect(requestInit?.method).toBeUndefined();
    expect(requestInit?.headers?.get('Authorization')).toBeNull();
    expect(result).toEqual(payload);
  });

  it('propagates not found error when user is missing', async () => {
    mockFetch({ message: 'Пользователь не найден' }, 404, false);

    await expect(usersApi.getRatings('missing-user')).rejects.toMatchObject({
      status: 404,
      message: 'Пользователь не найден'
    });
  });
});
