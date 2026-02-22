import type { Location, To } from 'react-router-dom';

type RedirectSource = Pick<Location, 'pathname' | 'search' | 'hash'>;

export interface AuthRedirectState {
  from?: RedirectSource | null;
}

const isSafePathname = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.startsWith('/') &&
  !value.startsWith('//');

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

export const buildAuthRedirectState = (
  location: RedirectSource
): AuthRedirectState => ({
  from: {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash
  }
});

export const resolveAuthRedirectPath = (
  state: unknown,
  fallback: To
): To => {
  if (typeof state !== 'object' || state === null) {
    return fallback;
  }

  const { from } = state as AuthRedirectState;
  if (!from || typeof from !== 'object') {
    return fallback;
  }

  if (!isSafePathname(from.pathname)) {
    return fallback;
  }

  return `${from.pathname}${asString(from.search)}${asString(from.hash)}`;
};
