import React, { createContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'src/entities/User/types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (u: User, t: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readUserFromStorage());
  const [token, setToken] = useState<string | null>(() => readTokenFromStorage());

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
      localStorage.setItem(AUTH_TOKEN_KEY, t);
    } catch {}
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {}
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_USER_KEY || e.key === AUTH_TOKEN_KEY) {
        setUser(readUserFromStorage());
        setToken(readTokenFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, token, login, logout, isAuthenticated: !!user && !!token }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};