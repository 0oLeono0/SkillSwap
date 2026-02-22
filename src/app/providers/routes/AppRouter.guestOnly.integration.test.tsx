import { render, screen, waitFor } from '@testing-library/react';
import {
  Outlet,
  RouterProvider,
  createMemoryRouter,
  type RouteObject
} from 'react-router-dom';
import {
  AuthContext,
  type AuthContextType
} from '@/app/providers/auth/context';
import { ROUTES } from '@/shared/constants';
import { GuestOnlyRoute } from '@/shared/lib/GuestOnlyRoute/GuestOnlyRoute';
import { ProtectedRoute } from '@/shared/lib/ProtectedRoute/ProtectedRoute';

if (typeof globalThis.Request === 'undefined') {
  class RequestPolyfill {
    url: string;

    method: string;

    signal: AbortSignal;

    constructor(
      input: string | URL,
      init?: { method?: string; signal?: AbortSignal }
    ) {
      this.url = String(input);
      this.method = init?.method ?? 'GET';
      this.signal = init?.signal ?? new AbortController().signal;
    }
  }

  globalThis.Request = RequestPolyfill as unknown as typeof Request;
}

const createAuthContextValue = (
  overrides: Partial<AuthContextType> = {}
): AuthContextType => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: false,
  login: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  refresh: jest.fn().mockResolvedValue(undefined),
  updateProfile: jest.fn().mockResolvedValue(undefined),
  ...overrides
});

const authenticatedUser: NonNullable<AuthContextType['user']> = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'User',
  role: 'user',
  avatarUrl: null,
  cityId: null,
  birthDate: null,
  gender: null,
  bio: null,
  teachableSkills: [],
  learningSkills: []
};

const testRoutes: RouteObject[] = [
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestOnlyRoute>
        <Outlet />
      </GuestOnlyRoute>
    ),
    children: [{ index: true, element: <div>Login Page</div> }]
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <GuestOnlyRoute>
        <Outlet />
      </GuestOnlyRoute>
    ),
    children: [
      { index: true, element: <div>Register Step 1</div> },
      { path: 'step-2', element: <div>Register Step 2</div> },
      { path: 'step-3', element: <div>Register Step 3</div> }
    ]
  },
  {
    path: ROUTES.HOME,
    element: <Outlet />,
    children: [
      {
        path: ROUTES.CREATE,
        element: (
          <ProtectedRoute>
            <div>Create Page</div>
          </ProtectedRoute>
        )
      },
      {
        path: ROUTES.PROFILE.ROOT,
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [{ index: true, element: <div>Profile Personal Data</div> }]
      }
    ]
  }
];

const renderRouter = ({
  authValue,
  initialEntry
}: {
  authValue?: Partial<AuthContextType>;
  initialEntry:
    | string
    | {
        pathname: string;
        search?: string;
        hash?: string;
        state?: unknown;
      };
}) => {
  const router = createMemoryRouter(testRoutes, {
    initialEntries: [initialEntry]
  });

  return render(
    <AuthContext.Provider value={createAuthContextValue(authValue)}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
};

describe('AppRouter guest-only integration', () => {
  it('redirects authenticated user from /login to /profile', async () => {
    renderRouter({
      authValue: {
        user: authenticatedUser,
        accessToken: 'token-1',
        isAuthenticated: true
      },
      initialEntry: ROUTES.LOGIN
    });

    await waitFor(() => {
      expect(screen.getByText('Profile Personal Data')).toBeInTheDocument();
    });
  });

  it('redirects authenticated user from /register/step-2 to /profile', async () => {
    renderRouter({
      authValue: {
        user: authenticatedUser,
        accessToken: 'token-1',
        isAuthenticated: true
      },
      initialEntry: ROUTES.REGISTER_STEP_TWO
    });

    await waitFor(() => {
      expect(screen.getByText('Profile Personal Data')).toBeInTheDocument();
    });
  });

  it('redirects authenticated user to valid state.from target', async () => {
    renderRouter({
      authValue: {
        user: authenticatedUser,
        accessToken: 'token-1',
        isAuthenticated: true
      },
      initialEntry: {
        pathname: ROUTES.LOGIN,
        state: {
          from: {
            pathname: ROUTES.CREATE,
            search: '?draft=1',
            hash: '#form'
          }
        }
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Create Page')).toBeInTheDocument();
    });
  });
});
