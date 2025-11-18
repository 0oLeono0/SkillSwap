import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfilePersonalData } from '../ProfilePersonalData';
import { useAuth } from '@/app/providers/auth';
import { useFiltersBaseData } from '@/features/Filter/model/useFiltersBaseData';

jest.mock('@/app/providers/auth');
jest.mock('@/features/Filter/model/useFiltersBaseData');

jest.mock('@/shared/ui/DatePicker/DatePicker', () => ({
  DatePicker: ({ title, value, onChange }: { title?: string; value?: string; onChange?: (value: string) => void }) => (
    <label>
      {title}
      <input data-testid="date-picker" value={value ?? ''} onChange={(event) => onChange?.(event.target.value)} />
    </label>
  ),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseFiltersBaseData = useFiltersBaseData as jest.Mock;

describe('ProfilePersonalData component', () => {
  const updateProfile = jest.fn();

  beforeEach(() => {
    mockUseFiltersBaseData.mockReturnValue({
      cities: [
        { id: 1, name: 'City A' },
        { id: 2, name: 'City B' },
      ],
      skillGroups: [],
      isLoading: false,
      error: null,
    });
    mockUseAuth.mockReturnValue({
      user: {
        email: 'user@example.com',
        name: 'User',
        birthDate: '1990-01-01T00:00:00.000Z',
        gender: 'female',
        cityId: 2,
        bio: 'About me',
      },
      updateProfile,
    });
    updateProfile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not submit when no changes were made', () => {
    render(<ProfilePersonalData />);

    fireEvent.click(screen.getByRole('button', { name: /Сохранить/i }));

    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('trims inputs, normalizes values and submits form', async () => {
    render(<ProfilePersonalData />);

    fireEvent.change(screen.getByDisplayValue('user@example.com'), {
      target: { value: ' new@example.com ' },
    });
    fireEvent.change(screen.getByDisplayValue('User'), {
      target: { value: '  New Name  ' },
    });
    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '12.03.1990' },
    });
    fireEvent.change(screen.getByDisplayValue('City B'), {
      target: { value: 'City A' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Сохранить/i }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1);
    });

    const payload = updateProfile.mock.calls[0][0];
    expect(payload).toMatchObject({
      email: 'new@example.com',
      name: 'New Name',
      cityId: 1,
    });
    expect(payload.birthDate).toEqual(expect.any(String));
  });
});
