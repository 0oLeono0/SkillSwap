import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoritesProvider } from './FavoritesProvider';
import { useFavorites } from './useFavorites';

const mockUseAuth = jest.fn();

jest.mock('@/app/providers/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/shared/api/favorites', () => ({
  favoritesApi: {
    list: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
}));

const mockFavoritesApi = jest.requireMock('@/shared/api/favorites')
  .favoritesApi as jest.Mocked<Awaited<typeof import('@/shared/api/favorites')>['favoritesApi']>;

const Consumer = () => {
  const { favoriteAuthorIds, toggleFavorite, clearFavorites } = useFavorites();

  return (
    <div>
      <div data-testid="favorites">{favoriteAuthorIds.join(',')}</div>
      <button onClick={() => toggleFavorite('u1')}>toggle-u1</button>
      <button onClick={() => toggleFavorite('u2')}>toggle-u2</button>
      <button onClick={clearFavorites}>clear</button>
    </div>
  );
};

describe('FavoritesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ accessToken: 'token' });
  });

  it('loads favorites on mount', async () => {
    mockFavoritesApi.list.mockResolvedValue({ favorites: ['u1', 'u2'] });

    render(
      <FavoritesProvider>
        <Consumer />
      </FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('favorites')).toHaveTextContent('u1,u2');
    });
    expect(mockFavoritesApi.list).toHaveBeenCalledWith('token');
  });

  it('optimistically toggles favorites and syncs with API', async () => {
    mockFavoritesApi.list.mockResolvedValue({ favorites: [] });
    mockFavoritesApi.add.mockResolvedValue({ favorite: { targetUserId: 'u1' } });
    mockFavoritesApi.remove.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: ({ children }) => (
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      ),
    });

    await waitFor(() => expect(mockFavoritesApi.list).toHaveBeenCalled());

    act(() => {
      result.current.toggleFavorite('u1');
    });
    expect(result.current.favoriteAuthorIds).toContain('u1');

    act(() => {
      result.current.toggleFavorite('u1');
    });
    expect(result.current.favoriteAuthorIds).not.toContain('u1');
  });

  it('clears favorites', async () => {
    mockFavoritesApi.list.mockResolvedValue({ favorites: ['u1'] });
    mockFavoritesApi.clear.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <Consumer />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('favorites')).toHaveTextContent('u1'));

    await user.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByTestId('favorites')).toHaveTextContent('');
    expect(mockFavoritesApi.clear).toHaveBeenCalledWith('token');
  });
});
