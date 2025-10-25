/* eslint-disable react-refresh/only-export-components */
import { Suspense, type FC } from 'react';
import { createBrowserRouter, useLocation, Outlet, NavLink } from 'react-router-dom';
import BaseLayout from '@/app/layouts/BaseLayout';
import { NotFound } from '@/pages/NotFound';
import { ServerError } from '@/pages/ServerError';
import { ROUTES } from '@/shared/constants';
import { ProtectedRoute } from '@/shared/lib/ProtectedRoute/ProtectedRoute';
import Catalog from '@/pages/Catalog/ui/Catalog';
import SkillDetails from '@/pages/SkillDetails/ui/SkillDetails';

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

const LayoutStub: FC<{ title: string }> = ({ title }) => {
  const { pathname } = useLocation();
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Текущий путь: <code>{pathname}</code>
      </p>

      <nav style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <NavLink to="" end>
          Overview
        </NavLink>
        <NavLink to={ROUTES.PROFILE.CHILDREN.REQUESTS}>Requests</NavLink>
        <NavLink to={ROUTES.PROFILE.CHILDREN.EXCHANGES}>Exchanges</NavLink>
        <NavLink to={ROUTES.PROFILE.CHILDREN.FAVORITES}>Favorites</NavLink>
        <NavLink to={ROUTES.PROFILE.CHILDREN.SKILLS}>Skills</NavLink>
      </nav>

      <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16 }}>
        <Outlet />
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <BaseLayout />,
    children: [
      { index: true, element: <Catalog variant="home" /> },
      { path: ROUTES.CATALOG, element: <Catalog variant="catalog" /> },
      { path: ROUTES.CREATE, element: <Stub title="Create" /> },
      { path: ROUTES.LOGIN, element: <Stub title="Login" /> },
      { path: ROUTES.REGISTER, element: <Stub title="Register" /> },
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
            <LayoutStub title="Profile" />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Stub title="Profile / Overview" /> },
          { path: ROUTES.PROFILE.CHILDREN.REQUESTS, element: <Stub title="Profile / Requests" /> },
          { path: ROUTES.PROFILE.CHILDREN.EXCHANGES, element: <Stub title="Profile / Exchanges" /> },
          { path: ROUTES.PROFILE.CHILDREN.FAVORITES, element: <Stub title="Profile / Favorites" /> },
          { path: ROUTES.PROFILE.CHILDREN.SKILLS, element: <Stub title="Profile / Skills" /> },
        ],
      },

      {
        path: ROUTES.SERVER_ERROR,
        element: (
          <Suspense fallback={<div>Загрузка…</div>}>
            <ServerError />
          </Suspense>
        ),
      },
      {
        path: ROUTES.NOTFOUND,
        element: (
          <Suspense fallback={<div>Загрузка…</div>}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);
