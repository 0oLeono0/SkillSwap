import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
  useRef
} from 'react';
import {
  authApi,
  type ApiAuthUser,
  type AuthSuccessResponse,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
  ApiError
} from '@/shared/api/auth';
import { normalizeApiSkillList } from '@/entities/User/mappers';
import { AuthContext, type AuthContextType, type AuthUser } from './context';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

const initialState: AuthState = { user: null, accessToken: null };
const REFRESH_MARGIN_MS = 30_000;
const MIN_REFRESH_DELAY_MS = 5_000;
const DEFAULT_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

const SESSION_STORAGE_KEY = 'auth:session';
type StoredSession = { user: AuthUser };

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readStoredSession = (): StoredSession | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredSession;
    if (parsed?.user) return parsed;
  } catch (error) {
    console.warn('[AuthProvider] Failed to read stored session', error);
  }
  return null;
};

const persistSession = (user: AuthUser | null) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    if (!user) {
      storage.removeItem(SESSION_STORAGE_KEY);
    } else {
      storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user }));
    }
  } catch (error) {
    console.warn('[AuthProvider] Failed to persist session', error);
  }
};

const mapToAuthUser = (payloadUser: ApiAuthUser): AuthUser => ({
  id: payloadUser.id,
  email: payloadUser.email,
  name: payloadUser.name,
  role: payloadUser.role,
  avatarUrl: payloadUser.avatarUrl,
  cityId: payloadUser.cityId ?? null,
  birthDate: payloadUser.birthDate ?? null,
  gender: payloadUser.gender ?? null,
  bio: payloadUser.bio ?? null,
  teachableSkills: normalizeApiSkillList(payloadUser.teachableSkills),
  learningSkills: normalizeApiSkillList(payloadUser.learningSkills)
});

const decodeTokenExpiry = (token: string): number | null => {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    if (typeof decoded.exp === 'number') {
      return decoded.exp * 1000;
    }
  } catch {
    // игнорируем некорректные токены
  }

  return null;
};

const resolveRefreshDelay = (token: string) => {
  const expiry = decodeTokenExpiry(token);
  if (expiry) {
    const delay = expiry - Date.now() - REFRESH_MARGIN_MS;
    return Math.max(delay, MIN_REFRESH_DELAY_MS);
  }
  return DEFAULT_REFRESH_INTERVAL_MS;
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [isInitializing, setIsInitializing] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRefreshRef = useRef<Promise<AuthSuccessResponse> | null>(null);

  const applySession = useCallback((session: AuthSuccessResponse) => {
    const nextState: AuthState = {
      user: mapToAuthUser(session.user),
      accessToken: session.accessToken
    };
    setState(nextState);
    persistSession(nextState.user);
  }, []);

  const clearSession = useCallback(() => {
    setState(initialState);
    persistSession(null);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const login = useCallback<AuthContextType['login']>(
    async (credentials: LoginPayload) => {
      const response = await authApi.login(credentials);
      applySession(response);
    },
    [applySession]
  );

  const register = useCallback<AuthContextType['register']>(
    async (payload: RegisterPayload) => {
      const response = await authApi.register(payload);
      applySession(response);
    },
    [applySession]
  );

  const refresh = useCallback<AuthContextType['refresh']>(async () => {
    if (pendingRefreshRef.current) {
      return pendingRefreshRef.current;
    }
    const promise = Promise.resolve(authApi.refresh())
      .then((response) => {
        if (!response) {
          throw new Error('Refresh response is empty');
        }
        applySession(response);
        return response;
      })
      .finally(() => {
        if (pendingRefreshRef.current === promise) {
          pendingRefreshRef.current = null;
        }
      });

    pendingRefreshRef.current = promise;
    return promise;
  }, [applySession]);

  const logout = useCallback<AuthContextType['logout']>(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateProfile = useCallback<AuthContextType['updateProfile']>(
    async (payload: UpdateProfilePayload) => {
      const makeRequest = async (token: string) =>
        authApi.updateProfile(payload, token);

      const performUpdate = async (): Promise<void> => {
        const token = state.accessToken ?? (await refresh()).accessToken;
        const response = await makeRequest(token);
        setState((prev) => {
          const next: AuthState = {
            ...prev,
            user: mapToAuthUser(response.user),
            accessToken: token
          };
          persistSession(next.user);
          return next;
        });
      };

      try {
        await performUpdate();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshed = await refresh();
          await makeRequest(refreshed.accessToken).then((response) => {
            setState((prev) => {
              const next: AuthState = {
                ...prev,
                user: mapToAuthUser(response.user)
              };
              persistSession(next.user);
              return next;
            });
          });
          return;
        }
        throw error;
      }
    },
    [state.accessToken, refresh]
  );

  useEffect(() => {
    let mounted = true;
    const stored = readStoredSession();
    if (stored?.user) {
      setState({ user: stored.user, accessToken: null });
    }
    const initialise = async () => {
      try {
        await refresh();
      } catch (error) {
        if (error instanceof ApiError && [401, 403].includes(error.status)) {
          clearSession();
        } else {
          console.warn('[AuthProvider] Failed to refresh session', error);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initialise();
    return () => {
      mounted = false;
    };
  }, [refresh, clearSession]);

  useEffect(() => {
    const currentToken = state.accessToken;
    let cancelled = false;

    if (!currentToken) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      return;
    }

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    const delay = resolveRefreshDelay(currentToken);
    const scheduleRefresh = () => {
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          await refresh();
        } catch (error) {
          if (error instanceof ApiError && [401, 403].includes(error.status)) {
            clearSession();
          } else {
            console.warn('[AuthProvider] Scheduled refresh failed', error);
          }
        } finally {
          refreshTimeoutRef.current = null;
          if (!cancelled && state.accessToken === currentToken) {
            scheduleRefresh();
          }
        }
      }, delay);
    };

    scheduleRefresh();

    return () => {
      cancelled = true;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [state.accessToken, refresh, clearSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      isAuthenticated: Boolean(state.user && state.accessToken),
      isInitializing,
      login,
      register,
      logout,
      refresh,
      updateProfile
    }),
    [state, isInitializing, login, register, logout, refresh, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
