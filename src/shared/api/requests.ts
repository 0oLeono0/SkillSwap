import { authorizedRequest } from '@/shared/api/request';
import type { Request, RequestStatus } from '@/entities/Request/types';

export interface RequestsListResponse {
  incoming: Request[];
  outgoing: Request[];
}

export interface CreateRequestPayload {
  toUserId: string;
  userSkillId: string;
}

export const requestsApi = {
  fetchAll(accessToken: string) {
    return authorizedRequest<RequestsListResponse>('/requests', accessToken);
  },

  create(accessToken: string, payload: CreateRequestPayload) {
    return authorizedRequest<{ request: Request }>('/requests', accessToken, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateStatus(accessToken: string, requestId: string, status: RequestStatus) {
    return authorizedRequest<{ request: Request }>(
      `/requests/${requestId}`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }
    );
  }
};
