import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { SkillCategories } from '@/shared/lib/constants';
import { loadCatalogAuthors } from '@/pages/Catalog/model/catalogData';
import SkillDetails from './SkillDetails';

const mockToggleFavorite = jest.fn();
const mockIsFavorite = jest.fn(() => false);

jest.mock('@/pages/Catalog/model/catalogData', () => ({
  loadCatalogAuthors: jest.fn()
}));

jest.mock('@/app/providers/auth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    accessToken: null
  })
}));

jest.mock('@/app/providers/favorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorite: mockIsFavorite
  })
}));

jest.mock('@/shared/lib/router/useAuthEntryNavigation', () => ({
  useAuthEntryNavigation: () => ({
    navigateToLogin: jest.fn(),
    navigateToRegister: jest.fn()
  })
}));

const mockLoadCatalogAuthors = loadCatalogAuthors as jest.MockedFunction<
  typeof loadCatalogAuthors
>;

const makeCatalogResponse = (description: string) => ({
  authors: [
    {
      id: 'author-1',
      name: 'Иван',
      city: 'Москва',
      age: 25,
      about: 'Био автора',
      canTeach: [
        {
          id: 'author-1-teach-1-skill-1',
          title: 'React',
          description,
          type: 'teach' as const,
          category: SkillCategories.EDUCATION,
          categoryId: 1,
          userSkillId: 'skill-1',
          originalSkillId: 1,
          tags: [],
          imageUrls: []
        }
      ],
      wantsToLearn: []
    }
  ],
  page: 1,
  pageSize: 1,
  totalAuthors: 1
});

const relatedEmptyResponse = {
  authors: [],
  page: 1,
  pageSize: 4,
  totalAuthors: 0
};

const renderPage = () =>
  render(
    <MemoryRouter
      initialEntries={[ROUTES.SKILL_DETAILS.replace(':authorId', 'author-1')]}
    >
      <Routes>
        <Route path={ROUTES.SKILL_DETAILS} element={<SkillDetails />} />
      </Routes>
    </MemoryRouter>
  );

describe('SkillDetails description', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFavorite.mockReturnValue(false);
  });

  it('renders actual skill description when it exists', async () => {
    mockLoadCatalogAuthors
      .mockResolvedValueOnce(makeCatalogResponse('Настоящее описание навыка'))
      .mockResolvedValueOnce(relatedEmptyResponse);

    renderPage();

    expect(
      await screen.findByText('Настоящее описание навыка')
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/увлекаюсь этим навыком уже больше 10 лет/i)
    ).not.toBeInTheDocument();
  });

  it('renders fallback when skill description is empty', async () => {
    mockLoadCatalogAuthors
      .mockResolvedValueOnce(makeCatalogResponse('   '))
      .mockResolvedValueOnce(relatedEmptyResponse);

    renderPage();

    expect(
      await screen.findByText(/увлекаюсь этим навыком уже больше 10 лет/i)
    ).toBeInTheDocument();
  });
});
