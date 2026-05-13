export type SkillDetailsModalsProps = {
  isAuthModalOpen: boolean;
  isSuccessModalOpen: boolean;
  onCloseAuthModal: () => void;
  onCloseSuccessModal: () => void;
  onLoginRedirect: () => void;
  onRegisterRedirect: () => void;
};
