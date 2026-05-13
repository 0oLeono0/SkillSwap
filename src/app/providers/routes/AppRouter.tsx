/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import BaseLayout from '@/app/layouts/BaseLayout';
import { NotFound } from '@/pages/NotFound';
import { ServerError } from '@/pages/ServerError';
import { ROUTES } from '@/shared/constants';
import { authRoutes } from './authRoutes';
import { mainRoutes } from './mainRoutes';

export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: ROUTES.HOME,
    element: <BaseLayout />,
    children: mainRoutes
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
