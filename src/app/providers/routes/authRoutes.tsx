/* eslint-disable react-refresh/only-export-components */
import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { AuthStepOne, AuthStepThree, AuthStepTwo } from '@/pages/Auth';
import { ROUTES } from '@/shared/constants';
import { GuestOnlyRoute } from '@/shared/lib/GuestOnlyRoute/GuestOnlyRoute';

export const authRoutes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestOnlyRoute>
        <AuthLayout />
      </GuestOnlyRoute>
    ),
    children: [{ index: true, element: <AuthStepOne isRegistered /> }]
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <GuestOnlyRoute>
        <AuthLayout />
      </GuestOnlyRoute>
    ),
    children: [
      { index: true, element: <AuthStepOne /> },
      { path: 'step-2', element: <AuthStepTwo /> },
      { path: 'step-3', element: <AuthStepThree /> }
    ]
  }
];
