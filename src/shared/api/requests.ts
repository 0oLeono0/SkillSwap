import { request } from './request';
import type { Request, RequestStatus } from '@/entities/Request/types';

export interface RequestsListResponse {
  incoming: Request[];
  outgoing: Request[];
}

export interface CreateRequestPayload {
  toUserId: string;
  skillId: string;
}

export const requestsApi = {
  fetchAll(accessToken: string) {
    return request<RequestsListResponse>('/api/requests', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  create(accessToken: string, payload: CreateRequestPayload) {
    return request<{ request: Request }>('/api/requests', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  updateStatus(accessToken: string, requestId: string, status: RequestStatus) {
    return request<{ request: Request }>(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    });
  },
};
