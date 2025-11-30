import { request } from './request';

describe('request', () => {
  const originalFetch = globalThis.fetch;

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
});
