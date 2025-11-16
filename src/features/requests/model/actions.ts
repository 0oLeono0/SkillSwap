import type { RequestStatus } from '@/entities/Request/types';
import { requestsApi, type CreateRequestPayload } from '@/shared/api/requests';

export const createRequest = (accessToken: string, payload: CreateRequestPayload) => {
  return requestsApi.create(accessToken, payload).then(response => response.request);
};

export const updateRequestStatus = (accessToken: string, requestId: string, status: RequestStatus) => {
  return requestsApi.updateStatus(accessToken, requestId, status).then(response => response.request);
};

export const acceptRequest = (accessToken: string, requestId: string) =>
  updateRequestStatus(accessToken, requestId, 'accepted');

export const rejectRequest = (accessToken: string, requestId: string) =>
  updateRequestStatus(accessToken, requestId, 'rejected');
