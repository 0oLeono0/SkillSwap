import { request, ApiError } from './request';
import type { UserRole } from '@/shared/types/userRole';

export interface ApiUserSkill {
  id: string;
  title: string;
  categoryId: number | null;
  subcategoryId: number | null;
  description: string;
  imageUrls: string[];
}

export type ApiUserSkillResponse = ApiUserSkill | number;

export interface ApiAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  cityId?: number | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
  teachableSkills?: ApiUserSkillResponse[];
  learningSkills?: ApiUserSkillResponse[];
}

export interface AuthSuccessResponse {
  user: ApiAuthUser;
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  avatarUrl?: string | null;
  cityId?: number | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
  teachableSkills?: ApiUserSkill[];
  learningSkills?: ApiUserSkill[];
}

export interface UpdateProfilePayload {
  email?: string;
  name?: string;
  avatarUrl?: string | null;
  cityId?: number | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
  teachableSkills?: ApiUserSkill[];
  learningSkills?: ApiUserSkill[];
}

export const authApi = {
  login(payload: LoginPayload) {
    return request<AuthSuccessResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  register(payload: RegisterPayload) {
    return request<AuthSuccessResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  refresh() {
    return request<AuthSuccessResponse>('/api/auth/refresh', {
      method: 'POST',
    });
  },

  logout() {
    return request<void>('/api/auth/logout', {
      method: 'POST',
    });
  },

  me() {
    return request<{ user: ApiAuthUser }>('/api/auth/me');
  },

  updateProfile(payload: UpdateProfilePayload, accessToken: string) {
    return request<{ user: ApiAuthUser }>('/api/auth/me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  },
};

export { ApiError };
