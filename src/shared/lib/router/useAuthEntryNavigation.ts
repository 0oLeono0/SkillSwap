import { useCallback } from 'react';
import {
  useLocation,
  useNavigate,
  type NavigateOptions
} from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { buildAuthRedirectState, type AuthRedirectState } from './authRedirect';

type AuthEntryNavigateOptions = Omit<NavigateOptions, 'state'>;

export const useAuthRedirectState = (): AuthRedirectState => {
  const location = useLocation();
  return buildAuthRedirectState(location);
};

export const useAuthEntryNavigation = () => {
  const navigate = useNavigate();
  const authRedirectState = useAuthRedirectState();

  const navigateToLogin = useCallback(
    (options?: AuthEntryNavigateOptions) => {
      navigate(ROUTES.LOGIN, { ...options, state: authRedirectState });
    },
    [authRedirectState, navigate]
  );

  const navigateToRegister = useCallback(
    (options?: AuthEntryNavigateOptions) => {
      navigate(ROUTES.REGISTER, { ...options, state: authRedirectState });
    },
    [authRedirectState, navigate]
  );

  return {
    authRedirectState,
    navigateToLogin,
    navigateToRegister
  };
};
