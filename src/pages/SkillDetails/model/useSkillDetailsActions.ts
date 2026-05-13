import { useCallback, useState } from 'react';
import { useAuth } from '@/app/providers/auth';
import { useAuthEntryNavigation } from '@/shared/lib/router/useAuthEntryNavigation';
import { useSkillDetailsExchange } from './useSkillDetailsExchange';
import { useSkillDetailsFavorite } from './useSkillDetailsFavorite';
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    setIsAuthModalOpen(false);
    navigateToLogin();
  }, [navigateToLogin]);

  const handleRegisterRedirect = useCallback(() => {
    setIsAuthModalOpen(false);
    navigateToRegister();
  }, [navigateToRegister]);

  const favoriteActions = useSkillDetailsFavorite({
    authorId,
    isAuthenticated,
    onAuthRequired: handleOpenAuthModal
  });

  const exchangeActions = useSkillDetailsExchange({
    authorId,
    currentAuthor,
    selectedSkill,
    selectedSkillId,
    isAuthenticated,
    hasUser: Boolean(user),
    accessToken,
    onAuthRequired: handleOpenAuthModal
  });

  return {
    ...favoriteActions,
    isAuthModalOpen,
    ...exchangeActions,
    handleCloseAuthModal,
    handleLoginRedirect,
    handleRegisterRedirect
  };
};
