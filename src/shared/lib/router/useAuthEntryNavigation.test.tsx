import { act, renderHook } from '@testing-library/react';
import { ROUTES } from '@/shared/constants';
import {
  useAuthEntryNavigation,
  useAuthRedirectState
} from './useAuthEntryNavigation';

const navigateMock = jest.fn();
let locationMock = {
  pathname: '/create',
  search: '?draft=1',
  hash: '#form'
};

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationMock
  };
});

describe('useAuthEntryNavigation', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    locationMock = {
      pathname: '/create',
      search: '?draft=1',
      hash: '#form'
    };
  });

  it('returns redirect state derived from current location', () => {
    const { result } = renderHook(() => useAuthRedirectState());

    expect(result.current).toEqual({
      from: {
        pathname: '/create',
        search: '?draft=1',
        hash: '#form'
      }
    });
  });

  it('navigates to login with redirect state', () => {
    const { result } = renderHook(() => useAuthEntryNavigation());

    act(() => {
      result.current.navigateToLogin();
    });

    expect(navigateMock).toHaveBeenCalledWith(ROUTES.LOGIN, {
      state: {
        from: {
          pathname: '/create',
          search: '?draft=1',
          hash: '#form'
        }
      }
    });
  });

  it('navigates to register with redirect state and custom options', () => {
    const { result } = renderHook(() => useAuthEntryNavigation());

    act(() => {
      result.current.navigateToRegister({ replace: true });
    });

    expect(navigateMock).toHaveBeenCalledWith(ROUTES.REGISTER, {
      replace: true,
      state: {
        from: {
          pathname: '/create',
          search: '?draft=1',
          hash: '#form'
        }
      }
    });
  });
});
