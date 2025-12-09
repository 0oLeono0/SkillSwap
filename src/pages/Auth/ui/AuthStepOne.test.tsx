import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthStepOne } from './AuthStepOne';
import { ROUTES } from '@/shared/constants';

const loginMock = jest.fn();
const setCredentialsMock = jest.fn();
const clearMock = jest.fn();
const navigateMock = jest.fn();

jest.mock('@/app/providers/auth', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

jest.mock('@/pages/Auth/model/RegistrationContext', () => ({
  useRegistrationDraft: () => ({
    setCredentials: setCredentialsMock,
    clear: clearMock,
    credentials: null,
    stepTwo: null,
  }),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('AuthStepOne', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loginMock.mockResolvedValue(undefined);
  });

  it('stores credentials in context and navigates to step 2 for new registration', async () => {
    const user = userEvent.setup();
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    render(<AuthStepOne />);

    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');
    await user.click(screen.getByTestId('submit-button'));

    expect(setCredentialsMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(navigateMock).toHaveBeenCalledWith(ROUTES.REGISTER_STEP_TWO);
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('logs in existing user, clears draft and navigates home', async () => {
    const user = userEvent.setup();

    render(<AuthStepOne isRegistered />);

    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.type(screen.getByTestId('password-input'), 'secret');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret',
      });
    });
    expect(clearMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(ROUTES.HOME);
  });
});
