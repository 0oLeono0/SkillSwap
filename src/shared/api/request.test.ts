import { authorizedRequest, buildAuthHeaders, request } from './request';

describe('request', () => {
  const originalFetch = globalThis.fetch;
  const createFetchResponse = <T>(
    payload: T,
    contentType = 'application/json',
    status = 200,
    ok = true,
  ) =>
    ({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      headers: new Headers({ 'Content-Type': contentType }),
      json: async () => payload,
      text: async () => (typeof payload === 'string' ? payload : JSON.stringify(payload)),
    }) as Response;

  afterEach(() => {
    if (globalThis.fetch !== originalFetch) {
      globalThis.fetch = originalFetch;
    }
    jest.useRealTimers();
  });

  it('aborts on timeout', async () => {
    const fetchMock = jest.fn(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('The operation was aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const promise = request('/slow', { timeoutMs: 20 });

    await expect(promise).rejects.toEqual(expect.objectContaining({ status: 408, message: 'Request timeout' }));
    expect(fetchMock).toHaveBeenCalled();
  });

  it('propagates external abort signal', async () => {
    const controller = new AbortController();
    const fetchMock = jest.fn(
      () =>
        new Promise<Response>((_, reject) => {
          controller.signal.addEventListener(
            'abort',
            () => reject(new DOMException('The operation was aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const promise = request('/abort', { signal: controller.signal });
    controller.abort('stop');

    await expect(promise).rejects.toEqual(expect.objectContaining({ status: 499 }));
    expect(fetchMock).toHaveBeenCalled();
  });

  it('sets default Accept header and resolves JSON response', async () => {
    const payload = { foo: 'bar' };
    const fetchMock = jest.fn().mockResolvedValue(createFetchResponse(payload));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await request<typeof payload>('/hello');

    expect(result).toEqual(payload);
    const requestInit = fetchMock.mock.calls[0]?.[1] as { headers?: Headers; method?: string };
    const headers = requestInit.headers as Headers;
    expect(headers.get('Accept')).toBe('application/json');
  });

  it('does not set JSON content-type for FormData', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['hello'], { type: 'text/plain' }), 'hello.txt');
    const fetchMock = jest.fn().mockResolvedValue(createFetchResponse('ok', 'text/plain'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await request<string>('/upload', { method: 'POST', body: formData });

    const requestInit = fetchMock.mock.calls[0]?.[1] as { headers?: Headers } | undefined;
    const headers = requestInit?.headers as Headers;
    expect(headers.get('Content-Type')).toBeNull();
  });

  it('returns text payload when response is not JSON', async () => {
    const fetchMock = jest.fn().mockResolvedValue(createFetchResponse('plain-text', 'text/plain'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await request<string>('http://example.com/raw');

    expect(result).toBe('plain-text');
  });

  it('buildAuthHeaders sets Authorization and preserves existing headers', () => {
    const headers = buildAuthHeaders('token-123', { 'X-Custom': 'yes' });

    expect(headers.get('Authorization')).toBe('Bearer token-123');
    expect(headers.get('X-Custom')).toBe('yes');
  });

  it('authorizedRequest applies auth header and reuses request logic', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      createFetchResponse({ ok: true }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await authorizedRequest('/protected', 'secret', { method: 'POST' });

    const requestInit = fetchMock.mock.calls[0]?.[1] as { headers?: Headers; method?: string } | undefined;
    const headers = requestInit?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer secret');
    expect(requestInit?.method).toBe('POST');
  });
});
