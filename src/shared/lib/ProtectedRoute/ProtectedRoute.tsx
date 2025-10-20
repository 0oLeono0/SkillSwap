import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/app/providers/auth/useAuth"

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

//Раскоментить когда будет готов AuthProvider

//Пример использования
    // <Route
    //   path="/profile"
    //   element={
    //     <ProtectedRoute>
    //       <ProfilePage />
    //     </ProtectedRoute>
    //   }
    // />