/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import BaseLayout from '@/app/layouts/BaseLayout';
import { ROUTES } from '@/shared/constants';
import { authRoutes } from './authRoutes';
import { errorRoutes } from './errorRoutes';
import { mainRoutes } from './mainRoutes';

export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: ROUTES.HOME,
    element: <BaseLayout />,
    children: mainRoutes
  },
  ...errorRoutes
]);
