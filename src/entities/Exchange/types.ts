export type ExchangeStatus = 'active' | 'completed';

export interface ExchangeParticipant {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ExchangeRequestInfo {
  id: string;
  skillId: string;
  createdAt: string;
}

export interface Exchange {
  id: string;
  status: ExchangeStatus;
  confirmedAt: string;
  completedAt?: string | null;
  request: ExchangeRequestInfo;
  initiator: ExchangeParticipant;
  recipient: ExchangeParticipant;
}

export interface ExchangeMessage {
  id: string;
  exchangeId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: ExchangeParticipant;
}

export interface ExchangeWithMessages extends Exchange {
  messages: ExchangeMessage[];
}
