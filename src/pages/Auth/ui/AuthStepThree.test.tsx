import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ROUTES } from '@/shared/constants';

const mockNavigate = jest.fn();
const mockRegister = jest.fn();
const mockClear = jest.fn();
type Credentials = { email: string; password: string } | null;
type StepTwo =
  | {
      name: string;
      birthDate: string;
      gender: string;
      cityId: number;
      categoryId: number;
      subskillId: number;
      avatarUrl: string;
    }
  | null;

let registrationMock: { credentials: Credentials; stepTwo: StepTwo } = {
  credentials: { email: 'user@example.com', password: 'secret' },
  stepTwo: {
    name: 'User',
    birthDate: '2000-01-01',
    gender: 'male',
    cityId: 1,
    categoryId: 1,
    subskillId: 10,
    avatarUrl: '',
  },
};

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('@/app/providers/auth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

jest.mock('@/features/Filter/model/useFiltersBaseData', () => ({
  useFiltersBaseData: () => ({
    skillGroups: [
      {
        id: 1,
        name: 'Group',
        skills: [{ id: 10, name: 'Skill' }],
      },
    ],
  }),
}));

jest.mock('@/shared/ui/Modal/Modal', () => ({
  Modal: ({ children }: { children: React.ReactNode }) => <div data-testid="modal">{children}</div>,
}));

jest.mock('@/shared/ui/Select', () => ({
  Select: ({
    onChange,
    value,
    label,
    'data-testid': dataTestId,
  }: {
    onChange: (v: string) => void;
    value: string;
    label?: string;
    'data-testid'?: string;
  }) => (
    <label>
      {label}
      <select
        data-testid={dataTestId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">--</option>
        <option value="1">Group</option>
        <option value="10">Skill</option>
      </select>
    </label>
  ),
  SelectVariant: { Search: 'search' },
}));

jest.mock('@/pages/Auth/model/RegistrationContext', () => ({
  useRegistrationDraft: () => ({
    credentials: registrationMock.credentials,
    stepTwo: registrationMock.stepTwo,
    clear: mockClear,
  }),
}));

jest.mock('@/shared/assets/images/stock/stock.jpg', () => 'stock-main', { virtual: true });
jest.mock('@/shared/assets/images/stock/stock2.jpg', () => 'stock-second', { virtual: true });
jest.mock('@/shared/assets/images/stock/stock3.jpg', () => 'stock-third', { virtual: true });
jest.mock('@/shared/assets/images/stock/stock4.jpg', () => 'stock-fourth', { virtual: true });

import AuthStepThree from './AuthStepThree';

describe('AuthStepThree', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    registrationMock = {
      credentials: { email: 'user@example.com', password: 'secret' },
      stepTwo: {
        name: 'User',
        birthDate: '2000-01-01',
        gender: 'male',
        cityId: 1,
        categoryId: 1,
        subskillId: 10,
        avatarUrl: '',
      },
    };
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('redirects to step two when context data missing', async () => {
    registrationMock = { credentials: null, stepTwo: null };
    const { default: Component } = await import('./AuthStepThree');
    render(<Component />);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REGISTER_STEP_TWO);
  });

  it('submits registration using context data and form values', async () => {
    const user = userEvent.setup();
    render(<AuthStepThree />);

    await user.type(screen.getByTestId('skill-title-input'), 'My Skill');
    await user.type(screen.getByTestId('description-textarea'), 'About skill');
    await user.selectOptions(screen.getByTestId('category-select'), '1');
    await user.selectOptions(screen.getByTestId('subskill-select'), '10');
    await user.click(screen.getByTestId('preview-submit'));
    await user.click(screen.getByTestId('confirm-button'));

    expect(mockRegister).toHaveBeenCalled();
    expect(mockClear).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);
  });
});
