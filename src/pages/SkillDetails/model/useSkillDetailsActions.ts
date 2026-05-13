import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/providers/auth';
import { useFavorites } from '@/app/providers/favorites';
import { createRequest } from '@/features/requests/model/actions';
import { useAuthEntryNavigation } from '@/shared/lib/router/useAuthEntryNavigation';
import {
  SKILL_DETAILS_FAVORITE_BUTTON_LABELS,
  SKILL_DETAILS_PROPOSE_BUTTON_LABELS,
  SKILL_DETAILS_PROPOSED_BUTTON_STYLE
} from './constants';
import type {
  UseSkillDetailsActionsParams,
  UseSkillDetailsActionsResult
} from './types';

export const useSkillDetailsActions = ({
  authorId,
  currentAuthor,
  selectedSkill,
  selectedSkillId
}: UseSkillDetailsActionsParams): UseSkillDetailsActionsResult => {
  const { navigateToLogin, navigateToRegister } = useAuthEntryNavigation();
  const { isAuthenticated, user, accessToken } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProposalSent, setIsProposalSent] = useState(false);

  useEffect(() => {
    setIsProposalSent(false);
    setIsSuccessModalOpen(false);
  }, [selectedSkillId, authorId]);

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
      setIsAuthModalOpen(true);
    }
  }, [authorId, handleToggleFavorite, isAuthenticated]);

  const isCurrentAuthorFavorite = useMemo(
    () => (authorId ? isFavorite(authorId) : false),
    [authorId, isFavorite]
  );

  const favoriteButtonLabel = isCurrentAuthorFavorite
    ? SKILL_DETAILS_FAVORITE_BUTTON_LABELS.active
    : SKILL_DETAILS_FAVORITE_BUTTON_LABELS.inactive;

  const handleProposeExchange = useCallback(async () => {
    if (!selectedSkill || !currentAuthor) {
      return;
    }

    if (!isAuthenticated || !user || !accessToken) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await createRequest(accessToken, {
        toUserId: currentAuthor.id,
        userSkillId: selectedSkill.userSkillId
      });
      setIsProposalSent(true);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('[SkillDetails] Failed to create request', err);
    }
  }, [accessToken, currentAuthor, isAuthenticated, selectedSkill, user]);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    setIsAuthModalOpen(false);
    navigateToLogin();
  }, [navigateToLogin]);

  const handleRegisterRedirect = useCallback(() => {
    setIsAuthModalOpen(false);
    navigateToRegister();
  }, [navigateToRegister]);

  const proposeButtonLabel = isProposalSent
    ? SKILL_DETAILS_PROPOSE_BUTTON_LABELS.sent
    : SKILL_DETAILS_PROPOSE_BUTTON_LABELS.default;
  const proposeButtonStyle = isProposalSent
    ? SKILL_DETAILS_PROPOSED_BUTTON_STYLE
    : undefined;

  return {
    isFavorite,
    isCurrentAuthorFavorite,
    favoriteButtonLabel,
    isAuthModalOpen,
    isSuccessModalOpen,
    proposeButtonLabel,
    proposeButtonStyle,
    handleToggleFavorite,
    handleAuthorFavoriteClick,
    handleProposeExchange,
    handleCloseAuthModal,
    handleCloseSuccessModal,
    handleLoginRedirect,
    handleRegisterRedirect
  };
};
