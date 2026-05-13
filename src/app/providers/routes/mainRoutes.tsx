/* eslint-disable react-refresh/only-export-components */
import type { RouteObject } from 'react-router-dom';
import Catalog from '@/pages/Catalog/ui/Catalog';
import Create from '@/pages/Create/ui/Create';
import { ProfileLayout } from '@/pages/Profile';
import SkillDetails from '@/pages/SkillDetails';
import { ROUTES } from '@/shared/constants';
import { ProtectedRoute } from '@/shared/lib/ProtectedRoute/ProtectedRoute';
import { profileRoutes } from './profileRoutes';
import { RouteStub } from './RouteStub';

export const mainRoutes: RouteObject[] = [
  { index: true, element: <Catalog variant='home' /> },
  { path: ROUTES.CATALOG, element: <Catalog variant='catalog' /> },
  {
    path: ROUTES.CREATE,
    element: (
      <ProtectedRoute>
        <Create />
      </ProtectedRoute>
    )
  },
  { path: ROUTES.ABOUT, element: <RouteStub title='About' /> },
  { path: ROUTES.CONTACTS, element: <RouteStub title='Contacts' /> },
  { path: ROUTES.BLOG, element: <RouteStub title='Blog' /> },
  { path: ROUTES.SKILL_DETAILS, element: <SkillDetails /> },
  { path: ROUTES.POLICY, element: <RouteStub title='Policy' /> },
  { path: ROUTES.TERMS, element: <RouteStub title='Terms' /> },
  {
    path: ROUTES.PROFILE.ROOT,
    element: (
      <ProtectedRoute>
        <ProfileLayout />
      </ProtectedRoute>
    ),
    children: profileRoutes
  }
];
