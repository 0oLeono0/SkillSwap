import type { Request } from '@/entities/Request/types';
import { getRequests, addRequest, updateRequestStatus } from '@/entities/Request/model';

/**
 * Создание новой заявки
 */
export function createRequest(fromUserId: number, toUserId: number, skillId: string): Request {
  const existing = getRequests().find(r => 
    r.fromUserId === fromUserId &&
    r.toUserId === toUserId &&
    r.skillId === skillId &&
    r.status === 'pending'
  );

  if (existing) {
    return existing;
  }

  const request: Request = {
    id: crypto.randomUUID(),
    skillId,
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  addRequest(request);
  return request;
}

/**
 * Принятие заявки
 */
export function acceptRequest(requestId: string) {
  updateRequestStatus(requestId, 'accepted');
}

/**
 * Отклонение заявки
 */
export function rejectRequest(requestId: string) {
  updateRequestStatus(requestId, 'rejected');
}
