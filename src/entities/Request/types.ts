export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface RequestParticipant {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface RequestSkillInfo {
  id: string | null;
  title: string;
  type: 'teach' | 'learn';
  subcategoryId: number | null;
  categoryId: number | null;
}

export interface Request {
  id: string;
  userSkillId: string | null;
  skill: RequestSkillInfo;
  fromUserId: string;
  toUserId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  fromUser?: RequestParticipant;
  toUser?: RequestParticipant;
}
