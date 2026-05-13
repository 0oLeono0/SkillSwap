/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { NotFound } from '@/pages/NotFound';
import { ServerError } from '@/pages/ServerError';
import { ROUTES } from '@/shared/constants';

export const errorRoutes: RouteObject[] = [
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
];
