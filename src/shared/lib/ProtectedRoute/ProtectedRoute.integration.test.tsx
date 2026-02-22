import { useMemo, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';
import {
  AuthContext,
  type AuthContextType
} from '@/app/providers/auth/context';
import { ROUTES } from '@/shared/constants';
import { resolveAuthRedirectPath } from '@/shared/lib/router/authRedirect';
import { ProtectedRoute } from './ProtectedRoute';

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid='location'>
      {`${location.pathname}${location.search}${location.hash}`}
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <section>
      <h1>Login Page</h1>
      <button
        type='button'
        onClick={() => navigate(ROUTES.REGISTER, { state: location.state })}
      >
        Go to register
      </button>
    </section>
  );
};

interface RegisterPageProps {
  onRegistrationSuccess: () => void;
}

const RegisterPage = ({ onRegistrationSuccess }: RegisterPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegistration = () => {
    onRegistrationSuccess();
    const nextPath = resolveAuthRedirectPath(location.state, ROUTES.HOME);
    navigate(nextPath, { replace: true });
  };

  return (
    <section>
      <h1>Register Page</h1>
      <button type='button' onClick={handleRegistration}>
        Complete registration
      </button>
    </section>
  );
};

const createAuthContextValue = (isAuthenticated: boolean): AuthContextType => ({
  user: isAuthenticated
    ? {
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
    : null,
  accessToken: isAuthenticated ? 'token-1' : null,
  isAuthenticated,
  isInitializing: false,
  login: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  refresh: jest.fn().mockResolvedValue(undefined),
  updateProfile: jest.fn().mockResolvedValue(undefined)
});

const IntegrationApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authValue = useMemo(
    () => createAuthContextValue(isAuthenticated),
    [isAuthenticated]
  );

  return (
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[ROUTES.CREATE]}>
        <Routes>
          <Route
            path={ROUTES.CREATE}
            element={
              <ProtectedRoute>
                <div>Create page</div>
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route
            path={ROUTES.REGISTER}
            element={
              <RegisterPage
                onRegistrationSuccess={() => setIsAuthenticated(true)}
              />
            }
          />
          <Route path={ROUTES.HOME} element={<div>Home page</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute integration', () => {
  it('returns guest to original protected URL after registration', async () => {
    const user = userEvent.setup();
    render(<IntegrationApp />);

    expect(
      screen.getByRole('heading', { name: 'Login Page' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go to register' }));
    expect(
      screen.getByRole('heading', { name: 'Register Page' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Complete registration' })
    );

    expect(screen.getByText('Create page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(ROUTES.CREATE);
  });
});
