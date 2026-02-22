import type { ReactNode } from 'react';
import { Navigate, useLocation, type To } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/useAuth';
import { ROUTES } from '@/shared/constants';
import { resolveAuthRedirectPath } from '@/shared/lib/router/authRedirect';

interface GuestOnlyRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  authenticatedFallbackPath?: To;
}

const defaultFallback = (
  <div style={{ padding: 24, textAlign: 'center' }}>Загрузка...</div>
);

const authPathnames = new Set<string>([
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.REGISTER_STEP_TWO,
  ROUTES.REGISTER_STEP_THREE
]);

const resolveAuthenticatedRedirect = (target: To, fallback: To): To => {
  if (typeof target !== 'string') {
    return target;
  }

  const [pathname] = target.split(/[?#]/);
  if (authPathnames.has(pathname)) {
    return fallback;
  }

  return target;
};

export const GuestOnlyRoute = ({
  children,
  fallback = defaultFallback,
  authenticatedFallbackPath = ROUTES.PROFILE.ROOT
}: GuestOnlyRouteProps) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <>{fallback}</>;
  }

  if (isAuthenticated) {
    const nextPath = resolveAuthRedirectPath(
      location.state,
      authenticatedFallbackPath
    );

    return (
      <Navigate
        to={resolveAuthenticatedRedirect(nextPath, authenticatedFallbackPath)}
        replace
      />
    );
  }

  return <>{children}</>;
};
