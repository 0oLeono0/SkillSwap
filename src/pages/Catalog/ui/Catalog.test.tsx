import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { AuthContextType, AuthUser } from '@/app/providers/auth/context';
import { loadFiltersBaseData } from '@/features/Filter/model/filterBaseDataStore';
import type {
  CatalogAuthor,
  CatalogAuthorSkill,
  CatalogSearchResponse
} from '@/pages/Catalog/model/catalogData';
import { loadCatalogAuthors } from '@/pages/Catalog/model/catalogData';
import type { SkillsListProps } from '@/widgets/SkillsList/types';
import Catalog from './Catalog';

type ViewerAuthState = Pick<
  AuthContextType,
  'user' | 'accessToken' | 'isAuthenticated'
>;
type FiltersBaseDataResponse = Awaited<ReturnType<typeof loadFiltersBaseData>>;
type CatalogSkillType = CatalogAuthorSkill['type'];

const getFavoriteButtonName = (authorId: string) => `favorite-${authorId}`;

function assertNonEmptyText(value: string, fieldName: string) {
  if (value.trim().length === 0) {
    throw new Error(`${fieldName} must be non-empty`);
  }
}

function assertValidCategoryId(categoryId: number | null) {
  if (categoryId === null) {
    return;
  }

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    throw new Error('categoryId must be a positive integer or null');
  }
}

function assertSkillCollectionType(
  skills: CatalogAuthorSkill[],
  expectedType: CatalogSkillType,
  fieldName: 'canTeach' | 'wantsToLearn'
) {
  if (skills.some((skill) => skill.type !== expectedType)) {
    throw new Error(`${fieldName} must contain only "${expectedType}" skills`);
  }
}

function buildCatalogSkill(
  type: CatalogSkillType,
  overrides: Partial<Omit<CatalogAuthorSkill, 'type'>> = {}
): CatalogAuthorSkill {
  const defaults =
    type === 'teach'
      ? {
          id: 'teach-skill-1',
          title: 'React',
          description: 'React mentoring',
          category: 'Frontend',
          categoryId: 1,
          originalSkillId: 1,
          userSkillId: 'user-teach-skill-1'
        }
      : {
          id: 'learn-skill-1',
          title: 'TypeScript',
          description: 'TypeScript practice',
          category: 'Frontend',
          categoryId: 2,
          originalSkillId: 2,
          userSkillId: 'user-learn-skill-1'
        };

  const skill: CatalogAuthorSkill = {
    ...defaults,
    type,
    tags: ['tag1', 'tag2'],
    ...overrides
  };

  assertNonEmptyText(skill.title, 'skill title');
  assertValidCategoryId(skill.categoryId);

  return skill;
}

function buildTeachSkill(
  overrides: Partial<Omit<CatalogAuthorSkill, 'type'>> = {}
): CatalogAuthorSkill {
  return buildCatalogSkill('teach', overrides);
}

function buildLearnSkill(
  overrides: Partial<Omit<CatalogAuthorSkill, 'type'>> = {}
): CatalogAuthorSkill {
  return buildCatalogSkill('learn', overrides);
}

function buildCatalogAuthor({
  id = 'author-1',
  name = 'Author 1',
  status = 'active',
  city = 'City 1',
  age = 30,
  about,
  avatarUrl,
  isFavorite,
  canTeach = [buildTeachSkill()],
  wantsToLearn = [buildLearnSkill()]
}: Partial<Omit<CatalogAuthor, 'canTeach' | 'wantsToLearn'>> & {
  canTeach?: CatalogAuthor['canTeach'];
  wantsToLearn?: CatalogAuthor['wantsToLearn'];
} = {}): CatalogAuthor {
  assertNonEmptyText(name, 'author name');
  assertNonEmptyText(city, 'author city');

  if (!Number.isInteger(age) || age < 0) {
    throw new Error('author age must be a non-negative integer');
  }

  if (canTeach.length + wantsToLearn.length === 0) {
    throw new Error('catalog author must have at least one skill');
  }

  assertSkillCollectionType(canTeach, 'teach', 'canTeach');
  assertSkillCollectionType(wantsToLearn, 'learn', 'wantsToLearn');

  return {
    id,
    name,
    status,
    city,
    age,
    canTeach,
    wantsToLearn,
    ...(about ? { about } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
    ...(typeof isFavorite === 'boolean' ? { isFavorite } : {})
  };
}

function buildCatalogResponse({
  authors = [buildCatalogAuthor()],
  page = 1,
  pageSize = authors.length,
  totalAuthors = authors.length
}: {
  authors?: CatalogAuthor[];
  page?: number;
  pageSize?: number;
  totalAuthors?: number;
} = {}): CatalogSearchResponse {
  return {
    authors,
    page,
    pageSize,
    totalAuthors
  };
}

function buildFiltersBaseDataResponse(
  overrides: Partial<FiltersBaseDataResponse> = {}
): FiltersBaseDataResponse {
  return {
    cities: [],
    skillGroups: [],
    ...overrides
  };
}

function buildAuthenticatedUser(): AuthUser {
  return {
    id: 'user-1',
    name: 'User',
    email: 'user@example.com',
    role: 'user',
    teachableSkills: [],
    learningSkills: []
  };
}

function buildGuestViewerState(): ViewerAuthState {
  return {
    isAuthenticated: false,
    accessToken: null,
    user: null
  };
}

function buildAuthenticatedViewerState(): ViewerAuthState {
  return {
    isAuthenticated: true,
    accessToken: 'access-token',
    user: buildAuthenticatedUser()
  };
}

const mockToggleFavorite = jest.fn();
const mockNavigateToLogin = jest.fn();

let currentViewerState: ViewerAuthState = buildGuestViewerState();

jest.mock('@/widgets/SkillsList', () => ({
  SkillsList: (props: SkillsListProps) =>
    props.authors.length > 0 ? (
      <div>
        {props.authors.map((author) => (
          <div key={author.id}>
            <span>{`status-${author.id}-${author.status ?? 'missing'}`}</span>
            <button
              type='button'
              aria-label={getFavoriteButtonName(author.id)}
              onClick={() => props.onToggleFavorite(author.id)}
            >
              like
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div>Нет авторов</div>
    )
}));

jest.mock('@/features/Filter/ui/FilterPanel.tsx', () => ({
  FilterPanel: (props: { onStatusChange: (status: 'active') => void }) => (
    <div>
      filter
      <button type='button' onClick={() => props.onStatusChange('active')}>
        status-active
      </button>
    </div>
  )
}));

jest.mock('@/app/providers/auth', () => ({
  useAuth: () => currentViewerState
}));

jest.mock('@/app/providers/favorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    favoriteAuthorIds: []
  })
}));

jest.mock('@/shared/lib/router/useAuthEntryNavigation', () => ({
  useAuthEntryNavigation: () => ({
    navigateToLogin: mockNavigateToLogin
  })
}));

jest.mock('@/features/Filter/model/filterBaseDataStore', () => ({
  loadFiltersBaseData: jest.fn()
}));

jest.mock('@/pages/Catalog/model/catalogData', () => ({
  loadCatalogAuthors: jest.fn()
}));

const mockLoadFiltersBaseData = loadFiltersBaseData as jest.MockedFunction<
  typeof loadFiltersBaseData
>;
const mockLoadCatalogAuthors = loadCatalogAuthors as jest.MockedFunction<
  typeof loadCatalogAuthors
>;

function renderCatalog() {
  return render(
    <MemoryRouter>
      <Catalog variant='catalog' />
    </MemoryRouter>
  );
}

describe('Catalog favorite action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentViewerState = buildGuestViewerState();
    mockLoadCatalogAuthors.mockResolvedValue(buildCatalogResponse());
    mockLoadFiltersBaseData.mockResolvedValue(buildFiltersBaseDataResponse());
  });

  it('redirects guest to login on favorite click', async () => {
    const user = userEvent.setup();
    renderCatalog();
    const favoriteButton = await screen.findByRole('button', {
      name: getFavoriteButtonName('author-1')
    });

    await user.click(favoriteButton);

    expect(mockNavigateToLogin).toHaveBeenCalledTimes(1);
    expect(mockToggleFavorite).not.toHaveBeenCalled();
  });

  it('toggles favorite for authenticated user', async () => {
    currentViewerState = buildAuthenticatedViewerState();
    const user = userEvent.setup();
    renderCatalog();
    const favoriteButton = await screen.findByRole('button', {
      name: getFavoriteButtonName('author-1')
    });

    await user.click(favoriteButton);

    expect(mockNavigateToLogin).not.toHaveBeenCalled();
    expect(mockToggleFavorite).toHaveBeenCalledWith('author-1');
    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('toggles favorite for the author shown in the list', async () => {
    currentViewerState = buildAuthenticatedViewerState();
    mockLoadCatalogAuthors.mockResolvedValue(
      buildCatalogResponse({
        authors: [buildCatalogAuthor({ id: 'author-42', name: 'Author 42' })]
      })
    );
    const user = userEvent.setup();
    renderCatalog();
    const favoriteButton = await screen.findByRole('button', {
      name: getFavoriteButtonName('author-42')
    });

    await user.click(favoriteButton);

    expect(mockNavigateToLogin).not.toHaveBeenCalled();
    expect(mockToggleFavorite).toHaveBeenCalledWith('author-42');
    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('does not render favorite actions when catalog is empty', async () => {
    mockLoadCatalogAuthors.mockResolvedValue(
      buildCatalogResponse({ authors: [] })
    );

    renderCatalog();

    expect(await screen.findByText('Нет авторов')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: getFavoriteButtonName('author-1')
      })
    ).not.toBeInTheDocument();
    expect(mockToggleFavorite).not.toHaveBeenCalled();
    expect(mockNavigateToLogin).not.toHaveBeenCalled();
  });

  it('passes selected author status to catalog search', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await waitFor(() => {
      expect(mockLoadCatalogAuthors).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: 'status-active' }));

    await waitFor(() => {
      expect(mockLoadCatalogAuthors).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'active',
          page: 1
        }),
        expect.any(Object)
      );
    });
  });

  it('passes author status to catalog list', async () => {
    mockLoadCatalogAuthors.mockResolvedValue(
      buildCatalogResponse({
        authors: [
          buildCatalogAuthor({
            id: 'author-inactive',
            name: 'Inactive author',
            status: 'inactive'
          })
        ]
      })
    );

    renderCatalog();

    expect(
      await screen.findByText('status-author-inactive-inactive')
    ).toBeInTheDocument();
  });
});
