import { useAuth } from '@/app/providers/auth';
import { useSkillDetailsAuthModal } from './useSkillDetailsAuthModal';
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
  const { isAuthenticated, user, accessToken } = useAuth();
  const {
    isAuthModalOpen,
    handleOpenAuthModal,
    handleCloseAuthModal,
    handleLoginRedirect,
    handleRegisterRedirect
  } = useSkillDetailsAuthModal();

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
