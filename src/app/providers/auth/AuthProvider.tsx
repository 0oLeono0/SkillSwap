import {
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import type { User } from '@/entities/User/types';
import { AuthContext, type AuthContextType } from './context';

const AUTH_USER_KEY = 'auth:user';
const AUTH_TOKEN_KEY = 'auth:token';

function readUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function readTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readUserFromStorage());
  const [token, setToken] = useState<string | null>(() => readTokenFromStorage());

  const login = (nextUser: User, authToken: string) => {
    setUser(nextUser);
    setToken(authToken);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    } catch (error) {
      console.warn('[AuthProvider] Failed to persist auth data', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.warn('[AuthProvider] Failed to clear auth data', error);
    }
  };

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_USER_KEY || event.key === AUTH_TOKEN_KEY) {
        setUser(readUserFromStorage());
        setToken(readTokenFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, token, login, logout, isAuthenticated: Boolean(user && token) }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
