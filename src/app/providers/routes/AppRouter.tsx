/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import BaseLayout from '@/app/layouts/BaseLayout';
import { NotFound } from '@/pages/NotFound';
import { ServerError } from '@/pages/ServerError';
import { ROUTES } from '@/shared/constants';
import { ProtectedRoute } from '@/shared/lib/ProtectedRoute/ProtectedRoute';
import Catalog from '@/pages/Catalog/ui/Catalog';
import SkillDetails from '@/pages/SkillDetails';
import Create from '@/pages/Create/ui/Create';
import { ProfileLayout } from '@/pages/Profile';
import { authRoutes } from './authRoutes';
import { profileRoutes } from './profileRoutes';
import { RouteStub } from './RouteStub';

export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: ROUTES.HOME,
    element: <BaseLayout />,
    children: [
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
    ]
  },
  {
    path: ROUTES.SERVER_ERROR,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ServerError />
      </Suspense>
    )
  },
  {
    path: ROUTES.NOTFOUND,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <NotFound />
      </Suspense>
    )
  }
]);
