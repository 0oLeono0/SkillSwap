import type { UserRatingDto } from '@/shared/api/users';

export type ReviewsSectionProps = {
  latestRatings: UserRatingDto[];
  isLoading: boolean;
  error: string | null;
  ratingsCount: number;
  averageRating: number | null;
};
