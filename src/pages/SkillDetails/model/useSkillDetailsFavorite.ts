import { useCallback, useMemo } from 'react';
import { useFavorites } from '@/app/providers/favorites';
import { SKILL_DETAILS_FAVORITE_BUTTON_LABELS } from './constants';
import type {
  UseSkillDetailsFavoriteParams,
  UseSkillDetailsFavoriteResult
} from './types';

export const useSkillDetailsFavorite = ({
  authorId,
  isAuthenticated,
  onAuthRequired
}: UseSkillDetailsFavoriteParams): UseSkillDetailsFavoriteResult => {
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleToggleFavorite = useCallback(
    (targetAuthorId: string) => {
      toggleFavorite(targetAuthorId);
    },
    [toggleFavorite]
  );

  const handleAuthorFavoriteClick = useCallback(() => {
    if (isAuthenticated) {
      if (authorId) {
        handleToggleFavorite(authorId);
      }
    } else {
      onAuthRequired();
    }
  }, [authorId, handleToggleFavorite, isAuthenticated, onAuthRequired]);

  const isCurrentAuthorFavorite = useMemo(
    () => (authorId ? isFavorite(authorId) : false),
    [authorId, isFavorite]
  );

  const favoriteButtonLabel = isCurrentAuthorFavorite
    ? SKILL_DETAILS_FAVORITE_BUTTON_LABELS.active
    : SKILL_DETAILS_FAVORITE_BUTTON_LABELS.inactive;

  return {
    isFavorite,
    isCurrentAuthorFavorite,
    favoriteButtonLabel,
    handleToggleFavorite,
    handleAuthorFavoriteClick
  };
};
