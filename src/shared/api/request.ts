import { apiBaseUrl } from '@/shared/config/env';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type FetchRequestInit = globalThis.RequestInit;
type HeadersInit = globalThis.HeadersInit;

export interface RequestOptions extends FetchRequestInit {
  timeoutMs?: number;
}

export const buildAuthHeaders = (accessToken: string, headers?: HeadersInit) => {
  const next = new Headers(headers);
  next.set('Authorization', `Bearer ${accessToken}`);
  return next;
};

const buildUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${apiBaseUrl}${path}`;
  return `${apiBaseUrl}/${path}`;
};

const shouldAttachJsonHeader = (body: FetchRequestInit['body'], headers: Headers) => {
  if (!body) return false;
  if (body instanceof FormData) return false;
  if (headers.has('Content-Type')) return false;
  return true;
};

const ensureAcceptHeader = (headers: Headers) => {
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
};

const abortSignalFrom = (externalSignal: AbortSignal | undefined) => {
  const controller = new AbortController();

  if (!externalSignal) {
    return controller;
  }

  if (externalSignal.aborted) {
    controller.abort(externalSignal.reason);
    return controller;
  }

  externalSignal.addEventListener('abort', () => controller.abort(externalSignal.reason), {
    once: true,
  });

  return controller;
};

export async function request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const { timeoutMs, signal: externalSignal, ...restOptions } = options;
  const headers = new Headers(options.headers);
  const body = options.body;

  if (shouldAttachJsonHeader(body, headers)) {
    headers.set('Content-Type', 'application/json');
  }
  ensureAcceptHeader(headers);

  const controller = abortSignalFrom(externalSignal ?? undefined);
  const timeoutId =
    typeof timeoutMs === 'number' && timeoutMs > 0
      ? setTimeout(() => controller.abort(new ApiError(408, 'Request timeout')), timeoutMs)
      : null;

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...restOptions,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      const reason = controller.signal.reason;
      if (reason instanceof ApiError) {
        throw reason;
      }
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === 'string'
            ? reason
            : 'Request aborted';
      throw new ApiError(499, message, reason);
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  const isJson = contentType.includes('application/json');

  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload
        ? (payload.message as string)
        : response.statusText) || 'Request failed';
    const details = payload && typeof payload === 'object' && 'details' in payload ? payload.details : payload;
    throw new ApiError(response.status, message, details);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (payload as TResponse) ?? (undefined as TResponse);
}

export const authorizedRequest = <TResponse>(path: string, accessToken: string, options: RequestOptions = {}) =>
  request<TResponse>(path, {
    ...options,
    headers: buildAuthHeaders(accessToken, options.headers),
  });
