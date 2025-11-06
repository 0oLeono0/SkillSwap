export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

const buildUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
};

const shouldAttachJsonHeader = (body: RequestInit['body'], headers: Headers) => {
  if (!body) return false;
  if (body instanceof FormData) return false;
  if (headers.has('Content-Type')) return false;
  return true;
};

export async function request<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options.headers);
  const body = options.body;

  if (shouldAttachJsonHeader(body, headers)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });

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
