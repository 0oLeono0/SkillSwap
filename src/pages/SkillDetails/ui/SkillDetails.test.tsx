import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { SkillCategories } from '@/shared/lib/constants';
import { loadCatalogAuthors } from '@/pages/Catalog/model/catalogData';
import { materialsApi } from '@/shared/api/materials';
import SkillDetails from './SkillDetails';
import userEvent from '@testing-library/user-event';

const mockToggleFavorite = jest.fn();
const mockIsFavorite = jest.fn(() => false);

jest.mock('@/pages/Catalog/model/catalogData', () => ({
  loadCatalogAuthors: jest.fn()
}));

jest.mock('@/shared/api/materials', () => ({
  materialsApi: {
    listByUserSkill: jest.fn()
  }
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
const mockListMaterials = materialsApi.listByUserSkill as jest.MockedFunction<
  typeof materialsApi.listByUserSkill
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

const makeCatalogResponseWithTwoSkills = () => ({
  authors: [
    {
      id: 'author-1',
      name: 'Author',
      city: 'City',
      age: 25,
      about: 'Author bio',
      canTeach: [
        {
          id: 'author-1-teach-1-skill-1',
          title: 'React',
          description: 'React description',
          type: 'teach' as const,
          category: SkillCategories.EDUCATION,
          categoryId: 1,
          userSkillId: 'skill-1',
          originalSkillId: 1,
          tags: [],
          imageUrls: []
        },
        {
          id: 'author-1-teach-2-skill-2',
          title: 'Vue',
          description: 'Vue description',
          type: 'teach' as const,
          category: SkillCategories.EDUCATION,
          categoryId: 1,
          userSkillId: 'skill-2',
          originalSkillId: 2,
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

const makeMaterial = (overrides = {}) => ({
  id: 'material-1',
  userSkillId: 'skill-1',
  type: 'theory' as const,
  title: 'Theory material',
  description: 'Theory description',
  content: 'Theory content',
  position: 0,
  questions: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides
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
    mockListMaterials.mockResolvedValue({ materials: [] });
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

  it('opens auth modal for guest favorite action', async () => {
    const user = userEvent.setup();
    mockLoadCatalogAuthors
      .mockResolvedValueOnce(makeCatalogResponse('...'))
      .mockResolvedValueOnce(relatedEmptyResponse);
    renderPage();

    const favoriteButton = await screen.findByRole('button', {
      name: 'Добавить в избранное'
    });
    await user.click(favoriteButton);
    expect(
      await screen.findByText(
        'Чтобы предложить обмен, войдите или зарегистрируйтесь'
      )
    ).toBeInTheDocument();
    expect(mockToggleFavorite).not.toHaveBeenCalled();
  });

  it('loads materials for selected user skill', async () => {
    mockLoadCatalogAuthors
      .mockResolvedValueOnce(makeCatalogResponse('React description'))
      .mockResolvedValueOnce(relatedEmptyResponse);
    mockListMaterials.mockResolvedValue({ materials: [] });

    renderPage();

    await waitFor(() => {
      expect(mockListMaterials).toHaveBeenCalledWith('skill-1');
    });
  });

  it('renders materials grouped by type', async () => {
    mockLoadCatalogAuthors
      .mockResolvedValueOnce(makeCatalogResponse('React description'))
      .mockResolvedValueOnce(relatedEmptyResponse);
    mockListMaterials.mockResolvedValue({
      materials: [
        makeMaterial({
          id: 'theory-1',
          type: 'theory',
          title: 'Theory material',
          description: 'Read first',
          content: 'Theory content'
        }),
        makeMaterial({
          id: 'practice-1',
          type: 'practice',
          title: 'Practice material',
          description: 'Do task',
          content: 'Practice content'
        }),
        makeMaterial({
          id: 'testing-1',
          type: 'testing',
          title: 'Testing material',
          description: null,
          content: null,
          questions: [
            {
              id: 'question-1',
              materialId: 'testing-1',
              text: 'What is React?',
              position: 0,
              answerOptions: [
                {
                  id: 'answer-1',
                  questionId: 'question-1',
                  text: 'Correct answer should stay hidden',
                  isCorrect: true,
                  position: 0,
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z'
                }
              ],
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z'
            }
          ]
        })
      ]
    });

    renderPage();

    expect(await screen.findByText('Theory material')).toBeInTheDocument();
    expect(screen.getByText('Practice material')).toBeInTheDocument();
    expect(screen.getByText('Testing material')).toBeInTheDocument();
    expect(screen.getByText('Theory content')).toBeInTheDocument();
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(
      screen.queryByText('Correct answer should stay hidden')
    ).not.toBeInTheDocument();
  });

  it('renders empty materials state', async () => {
    mockLoadCatalogAuthors
      .mockResolvedValueOnce(makeCatalogResponse('React description'))
      .mockResolvedValueOnce(relatedEmptyResponse);
    mockListMaterials.mockResolvedValue({ materials: [] });

    renderPage();

    expect(
      await screen.findByText('Материалы для этого навыка пока не добавлены')
    ).toBeInTheDocument();
  });

  it('renders materials error state', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mockLoadCatalogAuthors
      .mockResolvedValueOnce(makeCatalogResponse('React description'))
      .mockResolvedValueOnce(relatedEmptyResponse);
    mockListMaterials.mockRejectedValue(new Error('materials failed'));

    renderPage();

    expect(
      await screen.findByText('Не удалось загрузить материалы')
    ).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it('clears old materials after selected skill changes', async () => {
    const user = userEvent.setup();
    mockLoadCatalogAuthors
      .mockResolvedValueOnce(makeCatalogResponseWithTwoSkills())
      .mockResolvedValue(relatedEmptyResponse);
    mockListMaterials.mockImplementation(async (userSkillId) => ({
      materials:
        userSkillId === 'skill-1'
          ? [makeMaterial({ id: 'react-material', title: 'React material' })]
          : [
              makeMaterial({
                id: 'vue-material',
                userSkillId: 'skill-2',
                title: 'Vue material'
              })
            ]
    }));

    renderPage();

    expect(await screen.findByText('React material')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Vue' }));

    expect(await screen.findByText('Vue material')).toBeInTheDocument();
    expect(screen.queryByText('React material')).not.toBeInTheDocument();
    expect(mockListMaterials).toHaveBeenCalledWith('skill-2');
  });
});
