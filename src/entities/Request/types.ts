export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'inProgress'
  | 'done';

export interface Request {
  id: string;
  skillId: string;
  fromUserId: number;
  toUserId: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
}
