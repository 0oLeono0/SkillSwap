import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '@/app/providers/auth/context';
import { ProtectedRoute } from './ProtectedRoute';

const createAuthContextValue = (
  overrides: Partial<AuthContextType> = {},
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
  ...overrides,
});

const renderWithRouter = (ui: ReactElement, authValue?: Partial<AuthContextType>) => {
  return render(
    <AuthContext.Provider value={createAuthContextValue(authValue)}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={ui} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
};

describe('ProtectedRoute', () => {
  it('renders fallback while auth is initializing', () => {
    renderWithRouter(<ProtectedRoute fallback={<div>Loading...</div>}>Private</ProtectedRoute>, {
      isInitializing: true,
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    renderWithRouter(<ProtectedRoute>Private</ProtectedRoute>, {
      isAuthenticated: false,
      user: null,
    });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows access when user has allowed role', () => {
    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Private Content</div>
      </ProtectedRoute>,
      {
        isAuthenticated: true,
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: 'admin',
          avatarUrl: null,
          cityId: null,
          birthDate: null,
          gender: null,
          bio: null,
          teachableSkills: [],
          learningSkills: [],
        },
      },
    );

    expect(screen.getByText('Private Content')).toBeInTheDocument();
  });
});
