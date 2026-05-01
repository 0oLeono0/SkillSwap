import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/app/providers/auth';
import type {
  Exchange,
  ExchangeStatus,
  ExchangeWithMessages
} from '@/entities/Exchange/types';
import { loadFiltersBaseData } from '@/features/Filter/model/filterBaseDataStore';
import { exchangesApi } from '@/shared/api/exchanges';
import { useUserRatings } from '@/entities/User/model/useUserRatings';
import {
  ProfileExchanges,
  formatDateTime,
  getRoleLabel,
  parseSkillMeta
} from '../ProfileExchanges';

jest.mock('@/app/providers/auth');
jest.mock('@/features/Filter/model/filterBaseDataStore');
jest.mock('@/entities/User/model/useUserRatings', () => ({
  useUserRatings: jest.fn()
}));
jest.mock('@/shared/api/exchanges', () => ({
  exchangesApi: {
    fetchAll: jest.fn(),
    fetchById: jest.fn(),
    sendMessage: jest.fn(),
    complete: jest.fn(),
    rate: jest.fn()
  }
}));

const mockUseAuth = useAuth as jest.Mock;
const mockLoadFiltersBaseData = loadFiltersBaseData as jest.MockedFunction<
  typeof loadFiltersBaseData
>;
const mockFetchAll = exchangesApi.fetchAll as jest.MockedFunction<
  typeof exchangesApi.fetchAll
>;
const mockFetchById = exchangesApi.fetchById as jest.MockedFunction<
  typeof exchangesApi.fetchById
>;
const mockRateExchange = exchangesApi.rate as jest.MockedFunction<
  typeof exchangesApi.rate
>;
const mockUseUserRatings = useUserRatings as jest.MockedFunction<
  typeof useUserRatings
>;

const makeRatingsState = (
  overrides: Partial<ReturnType<typeof useUserRatings>> = {}
): ReturnType<typeof useUserRatings> => ({
  ratings: [],
  averageRating: null,
  ratingsCount: 0,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  ...overrides
});

const createExchange = (overrides: Partial<Exchange> = {}): Exchange => ({
  id: overrides.id ?? 'exchange-1',
  status: overrides.status ?? 'active',
  confirmedAt: overrides.confirmedAt ?? '2026-04-30T10:00:00.000Z',
  completedAt: overrides.completedAt,
  request: overrides.request ?? {
    id: 'request-1',
    userSkillId: 'skill-1',
    skill: {
      id: 'skill-1',
      title: 'Проектное планирование',
      type: 'teach',
      subcategoryId: 10,
      categoryId: 1
    },
    createdAt: '2026-04-30T09:00:00.000Z'
  },
  initiator: overrides.initiator ?? {
    id: 'user-1',
    name: 'Я'
  },
  recipient: overrides.recipient ?? {
    id: 'user-2',
    name: 'Партнёр'
  }
});

const createExchangeDetails = (
  status: ExchangeStatus,
  overrides: Partial<ExchangeWithMessages> = {}
): ExchangeWithMessages => ({
  ...createExchange({
    status,
    completedAt: status === 'completed' ? '2026-04-30T12:00:00.000Z' : null
  }),
  messages: [],
  ...overrides
});

const setupProfileExchanges = async (
  exchange: ExchangeWithMessages,
  accessToken: string | null = 'token'
) => {
  mockUseAuth.mockReturnValue({
    isAuthenticated: Boolean(accessToken),
    accessToken,
    isInitializing: false,
    user: {
      id: 'user-1',
      name: 'Я',
      email: 'user@example.com',
      role: 'user'
    }
  });
  mockLoadFiltersBaseData.mockResolvedValue({
    cities: [],
    skillGroups: []
  });
  mockFetchAll.mockResolvedValue({ exchanges: [exchange] });
  mockFetchById.mockResolvedValue({ exchange });
  mockRateExchange.mockResolvedValue({
    rating: {
      id: 'rating-1',
      exchangeId: exchange.id,
      raterId: 'user-1',
      ratedUserId: 'user-2',
      score: 5,
      comment: 'Отличный обмен',
      createdAt: '2026-04-30T12:30:00.000Z',
      updatedAt: '2026-04-30T12:30:00.000Z'
    }
  });

  render(<ProfileExchanges />);
  await waitFor(() => {
    expect(mockFetchById).toHaveBeenCalledWith('token', exchange.id);
  });
};

describe('ProfileExchanges rating form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserRatings.mockReturnValue(makeRatingsState());
  });

  it('does not show rating form for active exchange', async () => {
    await setupProfileExchanges(createExchangeDetails('active'));

    expect(screen.queryByText('Оцените обмен')).not.toBeInTheDocument();
  });

  it('shows rating form for completed exchange', async () => {
    await setupProfileExchanges(createExchangeDetails('completed'));

    expect(await screen.findByText('Оцените обмен')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Сохранить оценку' })
    ).toBeInTheDocument();
  });

  it('sends rating with exchange id, token and payload', async () => {
    await setupProfileExchanges(createExchangeDetails('completed'));

    fireEvent.click(screen.getByLabelText('4'));
    fireEvent.change(screen.getByLabelText('Комментарий к оценке'), {
      target: { value: '  Хороший обмен  ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить оценку' }));

    await waitFor(() => {
      expect(mockRateExchange).toHaveBeenCalledWith('token', 'exchange-1', {
        score: 4,
        comment: 'Хороший обмен'
      });
    });
  });

  it('shows success state and blocks repeat submit after rating', async () => {
    await setupProfileExchanges(createExchangeDetails('completed'));

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить оценку' }));

    expect(
      await screen.findByText('Оценка сохранена. Спасибо за обратную связь.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Сохранить оценку' })
    ).not.toBeInTheDocument();
    expect(mockRateExchange).toHaveBeenCalledTimes(1);
  });

  it('shows duplicate rating error from 409 response', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mockRateExchange.mockRejectedValueOnce({ status: 409 });

    try {
      await setupProfileExchanges(createExchangeDetails('completed'));

      fireEvent.click(screen.getByRole('button', { name: 'Сохранить оценку' }));

      expect(
        await screen.findByText('Вы уже оценили этот обмен.')
      ).toBeInTheDocument();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('shows received reviews summary and count', async () => {
    mockUseUserRatings.mockReturnValue(
      makeRatingsState({
        averageRating: 4.9,
        ratingsCount: 2,
        ratings: [
          {
            id: 'rating-1',
            exchangeId: 'exchange-1',
            score: 5,
            comment: 'Отличный обмен',
            rater: { id: 'user-2', name: 'Анна', avatarUrl: null },
            createdAt: '2026-04-30T12:30:00.000Z',
            updatedAt: '2026-04-30T12:30:00.000Z'
          },
          {
            id: 'rating-2',
            exchangeId: 'exchange-2',
            score: 4,
            comment: null,
            rater: { id: 'user-3', name: 'Борис', avatarUrl: null },
            createdAt: '2026-04-29T12:30:00.000Z',
            updatedAt: '2026-04-29T12:30:00.000Z'
          }
        ]
      })
    );

    await setupProfileExchanges(createExchangeDetails('active'));

    expect(mockUseUserRatings).toHaveBeenCalledWith('user-1');
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('2 отзыва')).toBeInTheDocument();
  });

  it('shows received reviews list', async () => {
    const dateSpy = jest
      .spyOn(Date.prototype, 'toLocaleDateString')
      .mockReturnValue('30 апр. 2026 г.');
    mockUseUserRatings.mockReturnValue(
      makeRatingsState({
        averageRating: 5,
        ratingsCount: 1,
        ratings: [
          {
            id: 'rating-1',
            exchangeId: 'exchange-1',
            score: 5,
            comment: 'Очень полезная консультация',
            rater: { id: 'user-2', name: 'Анна', avatarUrl: null },
            createdAt: '2026-04-30T12:30:00.000Z',
            updatedAt: '2026-04-30T12:30:00.000Z'
          }
        ]
      })
    );

    try {
      await setupProfileExchanges(createExchangeDetails('active'));

      expect(screen.getByText('Анна')).toBeInTheDocument();
      expect(screen.getByText('Оценка: 5')).toBeInTheDocument();
      expect(screen.getByText('30 апр. 2026 г.')).toBeInTheDocument();
      expect(
        screen.getByText('Очень полезная консультация')
      ).toBeInTheDocument();
    } finally {
      dateSpy.mockRestore();
    }
  });

  it('shows empty received reviews state', async () => {
    await setupProfileExchanges(createExchangeDetails('active'));

    expect(screen.getByText('У вас пока нет отзывов')).toBeInTheDocument();
  });

  it('shows received reviews loading state', async () => {
    mockUseUserRatings.mockReturnValue(
      makeRatingsState({
        isLoading: true
      })
    );

    await setupProfileExchanges(createExchangeDetails('active'));

    expect(screen.getByText('Загрузка отзывов...')).toBeInTheDocument();
  });

  it('shows received reviews error state', async () => {
    mockUseUserRatings.mockReturnValue(
      makeRatingsState({
        error: 'Не удалось загрузить рейтинг пользователя'
      })
    );

    await setupProfileExchanges(createExchangeDetails('active'));

    expect(screen.getByText('Не удалось загрузить отзывы')).toBeInTheDocument();
  });
});

describe('ProfileExchanges helpers', () => {
  describe('formatDateTime', () => {
    it('returns placeholder for missing or invalid date', () => {
      expect(formatDateTime()).toBe('—');
      expect(formatDateTime('invalid-date')).toBe('—');
    });

    it('delegates to Date#toLocaleString for valid values', () => {
      const spy = jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockReturnValue('05 янв., 12:30');
      const result = formatDateTime('2024-01-05T12:30:00.000Z');

      expect(result).toBe('05 янв., 12:30');
      expect(spy).toHaveBeenCalledWith('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      spy.mockRestore();
    });
  });

  describe('parseSkillMeta', () => {
    const titles = new Map<number, string>([
      [10, 'Игра на гитаре'],
      [20, 'Frontend']
    ]);

    it('returns fallback when skill is missing', () => {
      expect(parseSkillMeta(undefined, titles).title).toBe('Неизвестный навык');
    });

    it('returns explicit title when provided', () => {
      expect(
        parseSkillMeta(
          {
            id: 'skill-1',
            title: 'Custom title',
            type: 'teach',
            subcategoryId: 10,
            categoryId: 1
          },
          titles
        ).title
      ).toBe('Custom title');
    });

    it('returns known title when map has entry', () => {
      expect(
        parseSkillMeta(
          {
            id: 'skill-2',
            title: '',
            type: 'teach',
            subcategoryId: 10,
            categoryId: 1
          },
          titles
        ).title
      ).toBe('Игра на гитаре');
    });

    it('returns fallback with id when title is missing', () => {
      expect(
        parseSkillMeta(
          {
            id: 'skill-3',
            title: '',
            type: 'teach',
            subcategoryId: 99,
            categoryId: 1
          },
          titles
        ).title
      ).toBe('Неизвестный навык #99');
    });
  });

  describe('getRoleLabel', () => {
    it('describes initiator role', () => {
      expect(getRoleLabel(true)).toBe('Вы инициировали обмен');
    });

    it('describes participant role', () => {
      expect(getRoleLabel(false)).toBe('Вы присоединились к обмену');
    });
  });
});
