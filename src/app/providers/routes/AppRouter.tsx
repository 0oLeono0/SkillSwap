/* eslint-disable react-refresh/only-export-components */
import { Suspense, type FC } from 'react';
import { createBrowserRouter, useLocation } from 'react-router-dom';
import BaseLayout from '@/app/layouts/BaseLayout';
import { NotFound } from '@/pages/NotFound';
import { ServerError } from '@/pages/ServerError';
import { ROUTES } from '@/shared/constants';
import { ProtectedRoute } from '@/shared/lib/ProtectedRoute/ProtectedRoute';
import Catalog from '@/pages/Catalog/ui/Catalog';
import { AuthStepOne, AuthStepTwo, AuthStepThree } from '@/pages/Auth';
import SkillDetails from '@/pages/SkillDetails/ui/SkillDetails';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import {
  ProfileLayout,
  ProfilePersonalData,
  ProfileSectionPlaceholder,
} from '@/pages/Profile';

const Stub: FC<{ title: string }> = ({ title }) => {
  const { pathname } = useLocation();
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Текущий путь: <code>{pathname}</code>
      </p>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <AuthLayout />,
    children: [{ index: true, element: <AuthStepOne isRegistered /> }],
  },
  {
    path: ROUTES.REGISTER,
    element: <AuthLayout />,
    children: [
      { index: true, element: <AuthStepOne /> },
      { path: 'step-2', element: <AuthStepTwo /> },
      { path: 'step-3', element: <AuthStepThree /> },
    ],
  },
  {
    path: ROUTES.HOME,
    element: <BaseLayout />,
    children: [
      { index: true, element: <Catalog variant="home" /> },
      { path: ROUTES.CATALOG, element: <Catalog variant="catalog" /> },
      { path: ROUTES.CREATE, element: <Stub title="Create" /> },
      { path: ROUTES.ABOUT, element: <Stub title="About" /> },
      { path: ROUTES.CONTACTS, element: <Stub title="Contacts" /> },
      { path: ROUTES.BLOG, element: <Stub title="Blog" /> },
      { path: ROUTES.SKILL_DETAILS, element: <SkillDetails /> },
      { path: ROUTES.POLICY, element: <Stub title="Policy" /> },
      { path: ROUTES.TERMS, element: <Stub title="Terms" /> },
      {
        path: ROUTES.PROFILE.ROOT,
        element: (
          <ProtectedRoute>
            <ProfileLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <ProfilePersonalData /> },
          {
            path: ROUTES.PROFILE.CHILDREN.REQUESTS,
            element: (
              <ProfileSectionPlaceholder
                title="Заявки"
                description="Здесь будут собраны входящие и исходящие заявки на обмен навыками."
              />
            ),
          },
          {
            path: ROUTES.PROFILE.CHILDREN.EXCHANGES,
            element: (
              <ProfileSectionPlaceholder
                title="Мои обмены"
                description="Следите за прогрессом и статусами ваших активных обменов."
              />
            ),
          },
          {
            path: ROUTES.PROFILE.CHILDREN.FAVORITES,
            element: (
              <ProfileSectionPlaceholder
                title="Избранное"
                description="Сохраняйте понравившиеся профили, чтобы быстро вернуться к ним позже."
              />
            ),
          },
          {
            path: ROUTES.PROFILE.CHILDREN.SKILLS,
            element: (
              <ProfileSectionPlaceholder
                title="Мои навыки"
                description="Управляйте списком навыков, которыми готовы делиться или которые хотите освоить."
              />
            ),
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.SERVER_ERROR,
    element: (
      <Suspense fallback={<div>Загрузка...</div>}>
        <ServerError />
      </Suspense>
    ),
  },
  {
    path: ROUTES.NOTFOUND,
    element: (
      <Suspense fallback={<div>Загрузка...</div>}>
        <NotFound />
      </Suspense>
    ),
  },
]);
