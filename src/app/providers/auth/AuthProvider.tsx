import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import {
  authApi,
  type ApiAuthUser,
  type AuthSuccessResponse,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
  ApiError,
} from '@/shared/api/auth';
import { normalizeApiSkillList } from '@/entities/User/mappers';
import { AuthContext, type AuthContextType, type AuthUser } from './context';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

const initialState: AuthState = { user: null, accessToken: null };

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
  learningSkills: normalizeApiSkillList(payloadUser.learningSkills),
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [isInitializing, setIsInitializing] = useState(true);

  const applySession = useCallback((session: AuthSuccessResponse) => {
    const nextState: AuthState = {
      user: mapToAuthUser(session.user),
      accessToken: session.accessToken,
    };
    setState(nextState);
    persistSession(nextState.user);
  }, []);

  const clearSession = useCallback(() => {
    setState(initialState);
    persistSession(null);
  }, []);

  const login = useCallback<AuthContextType['login']>(
    async (credentials: LoginPayload) => {
      const response = await authApi.login(credentials);
      applySession(response);
    },
    [applySession],
  );

  const register = useCallback<AuthContextType['register']>(
    async (payload: RegisterPayload) => {
      const response = await authApi.register(payload);
      applySession(response);
    },
    [applySession],
  );

  const refresh = useCallback<AuthContextType['refresh']>(async () => {
    const response = await authApi.refresh();
    applySession(response);
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
      if (!state.accessToken) {
        throw new Error('Access token is missing');
      }

      const response = await authApi.updateProfile(payload, state.accessToken);
      setState((prev) => {
        const next: AuthState = {
          ...prev,
          user: mapToAuthUser(response.user),
        };
        persistSession(next.user);
        return next;
      });
    },
    [state.accessToken],
  );

  useEffect(() => {
    let mounted = true;
    const stored = readStoredSession();
    if (stored?.user) {
      setState({ user: stored.user, accessToken: null });
      setIsInitializing(false);
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
      updateProfile,
    }),
    [state, isInitializing, login, register, logout, refresh, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
