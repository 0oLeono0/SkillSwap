/* eslint-disable react-refresh/only-export-components */
import type { RouteObject } from 'react-router-dom';
import {
  ProfileAdminPanel,
  ProfileExchanges,
  ProfileFavorites,
  ProfilePersonalData,
  ProfileRequests,
  ProfileSkillMaterialsPage,
  ProfileSkills
} from '@/pages/Profile';
import { ROUTES } from '@/shared/constants';
import { ProtectedRoute } from '@/shared/lib/ProtectedRoute/ProtectedRoute';

export const profileRoutes: RouteObject[] = [
  { index: true, element: <ProfilePersonalData /> },
  {
    path: ROUTES.PROFILE.CHILDREN.ADMIN,
    element: (
      <ProtectedRoute allowedRoles={['owner']}>
        <ProfileAdminPanel />
      </ProtectedRoute>
    )
  },
  {
    path: ROUTES.PROFILE.CHILDREN.REQUESTS,
    element: <ProfileRequests />
  },
  {
    path: ROUTES.PROFILE.CHILDREN.EXCHANGES,
    element: <ProfileExchanges />
  },
  {
    path: ROUTES.PROFILE.CHILDREN.FAVORITES,
    element: <ProfileFavorites />
  },
  {
    path: ROUTES.PROFILE.CHILDREN.SKILLS,
    element: <ProfileSkills />
  },
  {
    path: ROUTES.PROFILE.CHILDREN.SKILL_MATERIALS,
    element: <ProfileSkillMaterialsPage />
  }
];
