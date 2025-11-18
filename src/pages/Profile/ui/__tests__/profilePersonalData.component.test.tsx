import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfilePersonalData } from '../ProfilePersonalData';
import { useAuth } from '@/app/providers/auth';
import { getCities } from '@/features/Filter/utils';

jest.mock('@/app/providers/auth');
jest.mock('@/features/Filter/utils');

jest.mock('@/shared/ui/DatePicker/DatePicker', () => ({
  DatePicker: ({ title, value, onChange }: { title?: string; value?: string; onChange?: (value: string) => void }) => (
    <label>
      {title}
      <input
        data-testid="date-picker"
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  ),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockGetCities = getCities as jest.Mock;

describe('ProfilePersonalData component', () => {
  const updateProfile = jest.fn();

  beforeEach(() => {
    mockGetCities.mockReturnValue([
      { id: 1, name: 'Москва' },
      { id: 2, name: 'Санкт-Петербург' },
    ]);
    mockUseAuth.mockReturnValue({
      user: {
        email: 'user@example.com',
        name: 'User',
        birthDate: '1990-01-01T00:00:00.000Z',
        gender: 'Мужской',
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

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('trims inputs, normalizes values and submits form', async () => {
    render(<ProfilePersonalData />);

    fireEvent.change(screen.getByPlaceholderText('Ваш email'), {
      target: { value: ' new@example.com ' },
    });
    fireEvent.change(screen.getByPlaceholderText('Как к вам обращаться'), {
      target: { value: '  Новый  ' },
    });
    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '12.03.1990' },
    });
    fireEvent.change(screen.getByPlaceholderText('Укажите пол'), {
      target: { value: 'женский' },
    });
    fireEvent.change(screen.getByPlaceholderText('Город проживания'), {
      target: { value: 'Москва' },
    });
    fireEvent.change(screen.getByPlaceholderText('Коротко расскажите о себе'), {
      target: { value: '  Новая био  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1);
    });

    const payload = updateProfile.mock.calls[0][0];
    expect(payload).toMatchObject({
      email: 'new@example.com',
      name: 'Новый',
      gender: 'Женский',
      cityId: 1,
      bio: 'Новая био',
    });
    expect(payload.birthDate).toEqual(expect.any(String));
  });
});
