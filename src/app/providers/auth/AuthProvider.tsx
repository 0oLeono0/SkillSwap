import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { authApi, type AuthSuccessResponse, type LoginPayload, type RegisterPayload, ApiError } from '@/shared/api/auth';
import { AuthContext, type AuthContextType, type AuthUser } from './context';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
};

const mapToAuthUser = (payloadUser: AuthSuccessResponse['user']): AuthUser => ({
  id: payloadUser.id,
  email: payloadUser.email,
  name: payloadUser.name,
  avatarUrl: payloadUser.avatarUrl,
  cityId: payloadUser.cityId ?? null,
  birthDate: payloadUser.birthDate ?? null,
  gender: payloadUser.gender ?? null,
  bio: payloadUser.bio ?? null,
  teachableSkills: Array.isArray(payloadUser.teachableSkills) ? payloadUser.teachableSkills : [],
  learningSkills: Array.isArray(payloadUser.learningSkills) ? payloadUser.learningSkills : [],
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [isInitializing, setIsInitializing] = useState(true);

  const applySession = useCallback((session: AuthSuccessResponse) => {
    setState({
      user: mapToAuthUser(session.user),
      accessToken: session.accessToken,
    });
  }, []);

  const clearSession = useCallback(() => {
    setState(initialState);
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

  useEffect(() => {
    let mounted = true;
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
    }),
    [state, isInitializing, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
