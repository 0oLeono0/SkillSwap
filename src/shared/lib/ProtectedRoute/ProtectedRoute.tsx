import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/useAuth';
import type { UserRole } from '@/shared/types/userRole';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
}

const defaultFallback = (
  <div style={{ padding: 24, textAlign: 'center' }}>Загрузка...</div>
);

export const ProtectedRoute = ({
  children,
  allowedRoles,
  fallback = defaultFallback,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length) {
    const hasAccess = user && allowedRoles.includes(user.role);
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
