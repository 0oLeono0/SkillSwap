import type { Exchange, ExchangeMessage, ExchangeWithMessages } from '@/entities/Exchange/types';
import { request } from '@/shared/api/request';

export interface ExchangesListResponse {
  exchanges: Exchange[];
}

export interface ExchangeDetailsResponse {
  exchange: ExchangeWithMessages;
}

export interface SendExchangeMessageResponse {
  message: ExchangeMessage;
}

export interface CompleteExchangeResponse {
  exchange: Exchange;
}

export const exchangesApi = {
  fetchAll(accessToken: string) {
    return request<ExchangesListResponse>('/exchanges', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  fetchById(accessToken: string, exchangeId: string) {
    return request<ExchangeDetailsResponse>(`/exchanges/${exchangeId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  sendMessage(accessToken: string, exchangeId: string, content: string) {
    return request<SendExchangeMessageResponse>(`/exchanges/${exchangeId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content }),
    });
  },

  complete(accessToken: string, exchangeId: string) {
    return request<CompleteExchangeResponse>(`/exchanges/${exchangeId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
