import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type {
  CatalogAuthor,
  CatalogAuthorSkill
} from '@/pages/Catalog/model/catalogData';
import { useAuth } from '@/app/providers/auth';
import { useFavorites } from '@/app/providers/favorites';
import { createRequest } from '@/features/requests/model/actions';
import { useAuthEntryNavigation } from '@/shared/lib/router/useAuthEntryNavigation';

type UseSkillDetailsActionsParams = {
  authorId: string;
  currentAuthor: CatalogAuthor | null;
  selectedSkill: CatalogAuthorSkill | null;
  selectedSkillId: string | null;
};

export const useSkillDetailsActions = ({
  authorId,
  currentAuthor,
  selectedSkill,
  selectedSkillId
}: UseSkillDetailsActionsParams) => {
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
    ? 'Убрать из избранного'
    : 'Добавить в избранное';

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
    ? 'Обмен предложен'
    : 'Предложить обмен';
  const proposeButtonStyle: CSSProperties | undefined = isProposalSent
    ? {
        backgroundColor: '#fff',
        color: '#000',
        borderColor: 'var(--button-color-accent)'
      }
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
