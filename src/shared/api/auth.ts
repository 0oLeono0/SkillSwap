import { request, authorizedRequest, ApiError } from '@/shared/api/request';
export type {
  ApiAuthUser,
  ApiUserSkill,
  AuthSuccessResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload
} from '@skillswap/contracts/auth';
import type {
  ApiAuthUser,
  AuthSuccessResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload
} from '@skillswap/contracts/auth';

export const authApi = {
  login(payload: LoginPayload) {
    return request<AuthSuccessResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  register(payload: RegisterPayload) {
    return request<AuthSuccessResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  refresh() {
    return request<AuthSuccessResponse>('/auth/refresh', {
      method: 'POST'
    });
  },

  logout() {
    return request<void>('/auth/logout', {
      method: 'POST'
    });
  },

  me() {
    return request<{ user: ApiAuthUser }>('/auth/me');
  },

  updateProfile(payload: UpdateProfilePayload, accessToken: string) {
    return authorizedRequest<{ user: ApiAuthUser }>('/auth/me', accessToken, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }
};

export { ApiError };
