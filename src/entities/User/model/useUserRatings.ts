import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  UserRatingDto,
  UserRatingsResponse
} from '@skillswap/contracts/ratings';
import { usersApi } from '@/shared/api/users';

type UserRatingsState = UserRatingsResponse & {
  isLoading: boolean;
  error: string | null;
};

export type UseUserRatingsResult = UserRatingsState & {
  refetch: () => Promise<void>;
};

const emptyRatingsState: UserRatingsState = {
  ratings: [],
  averageRating: null,
  ratingsCount: 0,
  isLoading: false,
  error: null
};

const normalizeUserId = (userId?: string | null) => {
  const normalized = userId?.trim() ?? '';
  return normalized.length > 0 ? normalized : null;
};

const getErrorMessage = (error: unknown) => {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : null;

  if (status === 404) {
    return 'Пользователь не найден';
  }

  return 'Не удалось загрузить рейтинг пользователя';
};

export const useUserRatings = (
  userId?: string | null
): UseUserRatingsResult => {
  const [state, setState] = useState<UserRatingsState>(emptyRatingsState);
  const requestIdRef = useRef(0);

  const loadRatings = useCallback(async () => {
    const normalizedUserId = normalizeUserId(userId);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!normalizedUserId) {
      setState(emptyRatingsState);
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null
    }));

    try {
      const data = await usersApi.getRatings(normalizedUserId);
      if (requestIdRef.current !== requestId) {
        return;
      }

      setState({
        ratings: data.ratings as UserRatingDto[],
        averageRating: data.averageRating,
        ratingsCount: data.ratingsCount,
        isLoading: false,
        error: null
      });
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setState({
        ...emptyRatingsState,
        error: getErrorMessage(error)
      });
    }
  }, [userId]);

  useEffect(() => {
    loadRatings().catch(() => undefined);
  }, [loadRatings]);

  const refetch = useCallback(() => loadRatings(), [loadRatings]);

  return useMemo(
    () => ({
      ...state,
      refetch
    }),
    [refetch, state]
  );
};
