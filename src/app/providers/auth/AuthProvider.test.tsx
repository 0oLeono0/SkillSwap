import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

const mockAuthApi = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
};

jest.mock('@/shared/api/auth', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number) {
      super('ApiError');
      this.status = status;
    }
  },
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
  learningSkills: [],
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const api = jest.requireMock('@/shared/api/auth').authApi as typeof mockAuthApi;
    api.login = mockAuthApi.login;
    api.register = mockAuthApi.register;
    api.refresh = mockAuthApi.refresh;
    api.logout = mockAuthApi.logout;
    api.updateProfile = mockAuthApi.updateProfile;
  });

  it('logs in and sets session', async () => {
    mockAuthApi.login.mockResolvedValue({ user: sampleUser, accessToken: 'token' });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.login({ email: 'user@test.io', password: 'pass' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe('u1');
    expect(mockAuthApi.login).toHaveBeenCalledWith({ email: 'user@test.io', password: 'pass' });
  });

  it('handles refresh failure by clearing session', async () => {
    mockAuthApi.refresh.mockRejectedValue({ status: 401 });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.isInitializing).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates profile and keeps token', async () => {
    mockAuthApi.login.mockResolvedValue({ user: sampleUser, accessToken: 'token' });
    mockAuthApi.updateProfile.mockResolvedValue({ user: { ...sampleUser, name: 'Updated' } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.login({ email: 'user@test.io', password: 'pass' });
    });

    await act(async () => {
      await result.current.updateProfile({ name: 'Updated' });
    });

    expect(result.current.user?.name).toBe('Updated');
    expect(result.current.accessToken).toBe('token');
    expect(mockAuthApi.updateProfile).toHaveBeenCalledWith({ name: 'Updated' }, 'token');
  });
});
