import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

const mockAuthApi = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn()
};

jest.mock('@/shared/api/auth', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn()
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number) {
      super('ApiError');
      this.status = status;
    }
  }
}));

const sampleUser = {
  id: 'u1',
  email: 'user@test.io',
  name: 'User',
  role: 'user',
  avatarUrl: null,
  cityId: null,
  birthDate: null,
  gender: null,
  bio: null,
  teachableSkills: [],
  learningSkills: []
};

const createApiError = (status: number) =>
  new (jest.requireMock('@/shared/api/auth').ApiError)(status);

const createJwtWithExp = (expMs: number) => {
  const toBase64Url = (data: object) =>
    btoa(JSON.stringify(data))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  const header = toBase64Url({ alg: 'HS256', typ: 'JWT' });
  const payload = toBase64Url({ exp: Math.floor(expMs / 1000) });
  return `${header}.${payload}.signature`;
};

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const api = jest.requireMock('@/shared/api/auth')
      .authApi as typeof mockAuthApi;
    api.login = mockAuthApi.login;
    api.register = mockAuthApi.register;
    api.refresh = mockAuthApi.refresh;
    api.logout = mockAuthApi.logout;
    api.updateProfile = mockAuthApi.updateProfile;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('logs in and sets session', async () => {
    mockAuthApi.login.mockResolvedValue({
      user: sampleUser,
      accessToken: 'token'
    });
    mockAuthApi.refresh.mockRejectedValue(createApiError(401));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    await waitFor(() => expect(result.current.isInitializing).toBe(false));

    await act(async () => {
      await result.current.login({ email: 'user@test.io', password: 'pass' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe('u1');
    expect(mockAuthApi.login).toHaveBeenCalledWith({
      email: 'user@test.io',
      password: 'pass'
    });
  });

  it('handles refresh failure by clearing session', async () => {
    mockAuthApi.refresh.mockRejectedValue(createApiError(401));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    await waitFor(() => expect(result.current.isInitializing).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates profile and keeps token', async () => {
    mockAuthApi.login.mockResolvedValue({
      user: sampleUser,
      accessToken: 'token'
    });
    mockAuthApi.updateProfile.mockResolvedValue({
      user: { ...sampleUser, name: 'Updated' }
    });
    mockAuthApi.refresh.mockResolvedValue({
      user: sampleUser,
      accessToken: 'token'
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    await act(async () => {
      await result.current.login({ email: 'user@test.io', password: 'pass' });
    });

    await act(async () => {
      await result.current.updateProfile({ name: 'Updated' });
    });

    expect(result.current.user?.name).toBe('Updated');
    expect(result.current.accessToken).toBe('token');
    expect(mockAuthApi.updateProfile).toHaveBeenCalledWith(
      { name: 'Updated' },
      'token'
    );
  });

  it('retries profile update on 401 with refreshed token', async () => {
    mockAuthApi.login.mockResolvedValue({
      user: sampleUser,
      accessToken: 'expired'
    });
    const apiError = new (jest.requireMock('@/shared/api/auth').ApiError)(401);
    mockAuthApi.updateProfile
      .mockRejectedValueOnce(apiError)
      .mockResolvedValueOnce({ user: { ...sampleUser, name: 'AfterRefresh' } });
    mockAuthApi.refresh
      .mockResolvedValueOnce({ user: sampleUser, accessToken: 'fresh-token' })
      .mockResolvedValueOnce({ user: sampleUser, accessToken: 'fresh-token' });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    await act(async () => {
      await result.current.login({ email: 'user@test.io', password: 'pass' });
    });

    await act(async () => {
      await result.current.updateProfile({ name: 'AfterRefresh' });
    });

    expect(mockAuthApi.refresh).toHaveBeenCalled();
    expect(mockAuthApi.updateProfile).toHaveBeenCalledTimes(2);
    expect(mockAuthApi.updateProfile).toHaveBeenLastCalledWith(
      { name: 'AfterRefresh' },
      'fresh-token'
    );
    expect(result.current.user?.name).toBe('AfterRefresh');
  });

  it('keeps initializing until refresh resolves', async () => {
    const deferred = createDeferred<{
      user: typeof sampleUser;
      accessToken: string;
    }>();
    mockAuthApi.refresh.mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    expect(result.current.isInitializing).toBe(true);
    expect(mockAuthApi.refresh).toHaveBeenCalled();

    await act(async () => {
      deferred.resolve({ user: sampleUser, accessToken: 'token' });
      await deferred.promise;
    });

    await waitFor(() => expect(result.current.isInitializing).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('refreshes access token before expiry', async () => {
    jest.useFakeTimers();
    const now = new Date('2024-01-01T00:00:00Z');
    jest.setSystemTime(now);
    const accessToken = createJwtWithExp(now.getTime() + 60_000);

    mockAuthApi.refresh.mockResolvedValue({ user: sampleUser, accessToken });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    await waitFor(() => expect(result.current.accessToken).toBe(accessToken));
    const initialCalls = mockAuthApi.refresh.mock.calls.length;

    act(() => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() =>
      expect(mockAuthApi.refresh).toHaveBeenCalledTimes(initialCalls + 1)
    );
  });

  it('clears scheduled refresh on logout', async () => {
    jest.useFakeTimers();
    const now = new Date('2024-01-01T00:00:00Z');
    jest.setSystemTime(now);
    const accessToken = createJwtWithExp(now.getTime() + 60_000);

    mockAuthApi.refresh.mockResolvedValue({ user: sampleUser, accessToken });
    mockAuthApi.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    await waitFor(() => expect(result.current.accessToken).toBe(accessToken));
    expect(mockAuthApi.refresh).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.logout();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(mockAuthApi.refresh).toHaveBeenCalledTimes(1);
  });
});
