export interface ExchangeRatingDto {
  id: string;
  exchangeId: string;
  raterId: string;
  ratedUserId: string;
  score: number;
  comment?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExchangeRatingPayload {
  score: number;
  comment?: string | null | undefined;
}
