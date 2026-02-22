import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import {
  AuthContext,
  type AuthContextType
} from '@/app/providers/auth/context';
import { ROUTES } from '@/shared/constants';
import { GuestOnlyRoute } from './GuestOnlyRoute';

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

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid='location'>
      {`${location.pathname}${location.search}${location.hash}`}
    </div>
  );
};

const renderWithRouter = (
  ui: ReactElement,
  authValue?: Partial<AuthContextType>,
  initialEntry:
    | string
    | {
        pathname: string;
        search?: string;
        hash?: string;
        state?: unknown;
      } = ROUTES.LOGIN
) =>
  render(
    <AuthContext.Provider value={createAuthContextValue(authValue)}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={ROUTES.LOGIN} element={ui} />
          <Route path={ROUTES.PROFILE.ROOT} element={<div>Profile Page</div>} />
          <Route path={ROUTES.CREATE} element={<div>Create Page</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('GuestOnlyRoute', () => {
  it('renders fallback while auth is initializing', () => {
    renderWithRouter(
      <GuestOnlyRoute fallback={<div>Loading state</div>}>
        Guest page
      </GuestOnlyRoute>,
      { isInitializing: true }
    );

    expect(screen.getByText('Loading state')).toBeInTheDocument();
  });

  it('renders children for guests', () => {
    renderWithRouter(<GuestOnlyRoute>Guest page</GuestOnlyRoute>);

    expect(screen.getByText('Guest page')).toBeInTheDocument();
  });

  it('redirects authenticated user to state.from with search and hash', () => {
    renderWithRouter(
      <GuestOnlyRoute>Guest page</GuestOnlyRoute>,
      {
        isAuthenticated: true,
        accessToken: 'token-1',
        user: {
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
        }
      },
      {
        pathname: ROUTES.LOGIN,
        state: {
          from: {
            pathname: ROUTES.CREATE,
            search: '?draft=1',
            hash: '#form'
          }
        }
      }
    );

    expect(screen.getByText('Create Page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/create?draft=1#form'
    );
  });

  it('redirects authenticated user to profile when state points to auth path', () => {
    renderWithRouter(
      <GuestOnlyRoute>Guest page</GuestOnlyRoute>,
      {
        isAuthenticated: true,
        accessToken: 'token-1',
        user: {
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
        }
      },
      {
        pathname: ROUTES.LOGIN,
        state: {
          from: {
            pathname: ROUTES.REGISTER,
            search: '',
            hash: ''
          }
        }
      }
    );

    expect(screen.getByText('Profile Page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      ROUTES.PROFILE.ROOT
    );
  });
});
