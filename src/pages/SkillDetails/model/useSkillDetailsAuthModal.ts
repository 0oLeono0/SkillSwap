import { useCallback, useState } from 'react';
import { useAuthEntryNavigation } from '@/shared/lib/router/useAuthEntryNavigation';
import type { UseSkillDetailsAuthModalResult } from './types';

export const useSkillDetailsAuthModal = (): UseSkillDetailsAuthModalResult => {
  const { navigateToLogin, navigateToRegister } = useAuthEntryNavigation();
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

  return {
    isAuthModalOpen,
    handleOpenAuthModal,
    handleCloseAuthModal,
    handleLoginRedirect,
    handleRegisterRedirect
  };
};
