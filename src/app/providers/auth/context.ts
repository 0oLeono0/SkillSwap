import { createContext } from 'react';
import type {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/shared/api/auth';
import type { UserSkill } from '@/entities/User/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  cityId?: number | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
  teachableSkills?: UserSkill[];
  learningSkills?: UserSkill[];
}

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
