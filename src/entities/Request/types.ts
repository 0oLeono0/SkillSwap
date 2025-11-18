export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface RequestParticipant {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface Request {
  id: string;
  skillId: string;
  fromUserId: string;
  toUserId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  fromUser?: RequestParticipant;
  toUser?: RequestParticipant;
}
