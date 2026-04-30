import type { ExchangeRatingDto } from '@skillswap/contracts/ratings';
import { apiBaseUrl } from '@/shared/config/env';
import { exchangesApi } from './exchanges';

type CapturedRequestInit = {
  method?: string;
  body?: unknown;
  headers?: Headers;
};

describe('exchangesApi', () => {
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

  const mockFetch = (payload: unknown = {}) => {
    const fetchMock = jest.fn().mockResolvedValue(createFetchResponse(payload));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  };

  const expectLastRequest = (
    fetchMock: jest.Mock,
    path: string,
    method: string | undefined,
    body?: unknown
  ) => {
    const [url, init] = fetchMock.mock.calls.at(-1) ?? [];
    const requestInit = init as CapturedRequestInit | undefined;

    expect(url).toBe(`${apiBaseUrl}${path}`);
    expect(requestInit?.method).toBe(method);
    if (body !== undefined) {
      expect(requestInit?.body).toBe(JSON.stringify(body));
    }
    return requestInit;
  };

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('creates exchange rating with auth and returns created rating', async () => {
    const rating: ExchangeRatingDto = {
      id: 'rating-1',
      exchangeId: 'exchange-1',
      raterId: 'user-1',
      ratedUserId: 'user-2',
      score: 5,
      comment: 'Спасибо за обмен',
      createdAt: '2026-04-30T00:00:00.000Z',
      updatedAt: '2026-04-30T00:00:00.000Z'
    };
    const payload = {
      score: 5,
      comment: '  Спасибо за обмен  '
    };
    const fetchMock = mockFetch({ rating });

    const result = await exchangesApi.rate('token', 'exchange-1', payload);

    const requestInit = expectLastRequest(
      fetchMock,
      '/exchanges/exchange-1/rating',
      'POST',
      payload
    );
    expect((requestInit?.headers as Headers).get('Authorization')).toBe(
      'Bearer token'
    );
    expect(result).toEqual({ rating });
  });
});
