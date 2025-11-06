import { request, ApiError } from './request';

export interface ApiAuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  cityId?: number | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
  teachableSkills?: unknown;
  learningSkills?: unknown;
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
};

export { ApiError };
