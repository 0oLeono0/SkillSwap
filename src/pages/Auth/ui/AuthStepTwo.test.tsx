import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ROUTES } from '@/shared/constants';

const mockNavigate = jest.fn();
const mockSetStepTwo = jest.fn();
let mockCredentials: { email: string; password: string } | null = {
  email: 'user@example.com',
  password: 'secret',
};

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('@/features/Filter/model/useFiltersBaseData', () => ({
  useFiltersBaseData: () => ({
    cities: [],
    skillGroups: [],
  }),
}));

jest.mock('@/pages/Auth/model/RegistrationContext', () => ({
  useRegistrationDraft: () => ({
    credentials: mockCredentials,
    stepTwo: null,
    setStepTwo: mockSetStepTwo,
  }),
}));

import AuthStepTwo from './AuthStepTwo';

describe('AuthStepTwo', () => {
  it('saves step 2 data and navigates to step 3', async () => {
    const user = userEvent.setup();
    mockCredentials = { email: 'user@example.com', password: 'secret' };
    render(<AuthStepTwo />);

    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.click(screen.getByTestId('step-two-submit'));

    expect(mockSetStepTwo).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REGISTER_STEP_THREE);
  });

  it('redirects to register when credentials missing', async () => {
    mockCredentials = null;
    render(<AuthStepTwo />);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REGISTER);
  });
});
