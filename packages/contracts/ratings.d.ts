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

export interface RatingAuthorDto {
  id: string;
  name: string;
  avatarUrl?: string | null | undefined;
}

export interface UserRatingDto {
  id: string;
  exchangeId: string;
  score: number;
  comment?: string | null | undefined;
  rater: RatingAuthorDto;
  createdAt: string;
  updatedAt: string;
}

export interface UserRatingsResponse {
  averageRating: number | null;
  ratingsCount: number;
  ratings: UserRatingDto[];
}
