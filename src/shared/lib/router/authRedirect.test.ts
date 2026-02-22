import {
  buildAuthRedirectState,
  resolveAuthRedirectPath
} from './authRedirect';

describe('authRedirect helpers', () => {
  it('builds location state for auth redirect', () => {
    const state = buildAuthRedirectState({
      pathname: '/profile/skills',
      search: '?view=all',
      hash: '#top'
    });

    expect(state).toEqual({
      from: {
        pathname: '/profile/skills',
        search: '?view=all',
        hash: '#top'
      }
    });
  });

  it('resolves redirect path from state.from', () => {
    const path = resolveAuthRedirectPath(
      {
        from: {
          pathname: '/catalog',
          search: '?search=react',
          hash: '#result'
        }
      },
      '/'
    );

    expect(path).toBe('/catalog?search=react#result');
  });

  it('uses fallback for invalid states', () => {
    expect(resolveAuthRedirectPath(undefined, '/')).toBe('/');
    expect(resolveAuthRedirectPath({ from: null }, '/')).toBe('/');
    expect(resolveAuthRedirectPath({ from: { pathname: '' } }, '/')).toBe('/');
  });

  it('uses fallback for unsafe pathname', () => {
    const unsafeState = {
      from: {
        pathname: '//evil.com',
        search: '',
        hash: ''
      }
    };

    expect(resolveAuthRedirectPath(unsafeState, '/')).toBe('/');
  });
});
