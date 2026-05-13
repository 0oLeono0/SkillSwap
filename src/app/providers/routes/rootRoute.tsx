/* eslint-disable react-refresh/only-export-components */
import type { RouteObject } from 'react-router-dom';
import BaseLayout from '@/app/layouts/BaseLayout';
import { ROUTES } from '@/shared/constants';
import { mainRoutes } from './mainRoutes';

export const rootRoute: RouteObject = {
  path: ROUTES.HOME,
  element: <BaseLayout />,
  children: mainRoutes
};
