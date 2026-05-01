import { render, screen } from '@testing-library/react';
import { useUserRatings } from '@/entities/User/model/useUserRatings';
import { SkillCategories } from '@/shared/lib/constants';
import { SkillCard } from './SkillCard';
import type { SkillCardProps } from './types';

jest.mock('@/entities/User/model/useUserRatings', () => ({
  useUserRatings: jest.fn()
}));

const mockUseUserRatings = useUserRatings as jest.MockedFunction<
  typeof useUserRatings
>;

const buildProps = (
  overrides: Partial<SkillCardProps> = {}
): SkillCardProps => ({
  author: {
    id: 'author-1',
    avatar: '/avatar.png',
    name: 'Автор',
    city: 'Минск',
    age: 30
  },
  isLikeButtonVisible: true,
  isDetailsButtonVisible: true,
  skill: {
    id: 'skill-1',
    name: 'React',
    category: SkillCategories.EDUCATION
  },
  skillsToLearn: [],
  onDetailsButtonClick: jest.fn(),
  onLikeButtonClick: jest.fn(),
  isExchangeOffered: false,
  ...overrides
});

const mockRatingsState = (
  overrides: Partial<ReturnType<typeof useUserRatings>> = {}
) => {
  mockUseUserRatings.mockReturnValue({
    ratings: [],
    averageRating: null,
    ratingsCount: 0,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    ...overrides
  });
};

describe('SkillCard rating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRatingsState();
  });

  it('shows average rating and reviews count', () => {
    mockRatingsState({
      averageRating: 4.8,
      ratingsCount: 12
    });

    render(<SkillCard {...buildProps()} />);

    expect(mockUseUserRatings).toHaveBeenCalledWith('author-1');
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('12 отзывов')).toBeInTheDocument();
  });

  it('shows empty rating state', () => {
    mockRatingsState({
      averageRating: null,
      ratingsCount: 0
    });

    render(<SkillCard {...buildProps()} />);

    expect(screen.getByText('Нет оценок')).toBeInTheDocument();
  });

  it('shows loading rating state', () => {
    mockRatingsState({
      isLoading: true
    });

    render(<SkillCard {...buildProps()} />);

    expect(screen.getByText('Загрузка рейтинга...')).toBeInTheDocument();
  });

  it('shows fallback when rating loading failed', () => {
    mockRatingsState({
      error: 'Не удалось загрузить рейтинг пользователя'
    });

    render(<SkillCard {...buildProps()} />);

    expect(screen.getByText('Рейтинг недоступен')).toBeInTheDocument();
  });
});
