/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import { authRoutes } from './authRoutes';
import { errorRoutes } from './errorRoutes';
import { rootRoute } from './rootRoute';

export const router = createBrowserRouter([
  ...authRoutes,
  rootRoute,
  ...errorRoutes
]);
