import type {
  CreateExchangeRatingPayload,
  ExchangeRatingDto
} from '@skillswap/contracts/ratings';
import type {
  Exchange,
  ExchangeMessage,
  ExchangeWithMessages
} from '@/entities/Exchange/types';
import { authorizedRequest } from './request';

export type {
  CreateExchangeRatingPayload,
  ExchangeRatingDto
} from '@skillswap/contracts/ratings';

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

export interface RateExchangeResponse {
  rating: ExchangeRatingDto;
}

export const exchangesApi = {
  fetchAll(accessToken: string) {
    return authorizedRequest<ExchangesListResponse>('/exchanges', accessToken);
  },

  fetchById(accessToken: string, exchangeId: string) {
    return authorizedRequest<ExchangeDetailsResponse>(
      `/exchanges/${exchangeId}`,
      accessToken
    );
  },

  sendMessage(accessToken: string, exchangeId: string, content: string) {
    return authorizedRequest<SendExchangeMessageResponse>(
      `/exchanges/${exchangeId}/messages`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({ content })
      }
    );
  },

  complete(accessToken: string, exchangeId: string) {
    return authorizedRequest<CompleteExchangeResponse>(
      `/exchanges/${exchangeId}/complete`,
      accessToken,
      {
        method: 'POST'
      }
    );
  },

  rate(
    accessToken: string,
    exchangeId: string,
    payload: CreateExchangeRatingPayload
  ) {
    return authorizedRequest<RateExchangeResponse>(
      `/exchanges/${exchangeId}/rating`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  }
};
