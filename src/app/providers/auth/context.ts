/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import type { User } from '@/entities/User/types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
