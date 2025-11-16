import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { FavoritesContext } from './context';
import { useAuth } from '@/app/providers/auth';
import { favoritesApi } from '@/shared/api/favorites';

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { accessToken } = useAuth();
  const [favoriteAuthorIds, setFavoriteAuthorIds] = useState<string[]>([]);

  useEffect(() => {
    if (!accessToken) {
      setFavoriteAuthorIds([]);
      return;
    }

    let isMounted = true;
    favoritesApi
      .list(accessToken)
      .then((response) => {
        if (isMounted) {
          setFavoriteAuthorIds(response.favorites ?? []);
        }
      })
      .catch((error) => {
        console.error('[FavoritesProvider] Failed to fetch favorites', error);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const toggleFavorite = useCallback(
    (authorId: string) => {
      if (!accessToken) {
        console.warn('[FavoritesProvider] toggleFavorite requires auth');
        return;
      }

      let previous: string[] = [];
      let shouldFavorite = false;
      setFavoriteAuthorIds((prev) => {
        previous = prev;
        shouldFavorite = !prev.includes(authorId);
        return shouldFavorite
          ? [...prev, authorId]
          : prev.filter((id) => id !== authorId);
      });

      const request = shouldFavorite
        ? favoritesApi.add(accessToken, authorId)
        : favoritesApi.remove(accessToken, authorId);

      request.catch((error) => {
        console.error('[FavoritesProvider] Failed to sync favorite', error);
        setFavoriteAuthorIds(previous);
      });
    },
    [accessToken],
  );

  const setFavorite = useCallback(
    (authorId: string, shouldBeFavorite: boolean) => {
      if (!accessToken) {
        console.warn('[FavoritesProvider] setFavorite requires auth');
        return;
      }

      let previous: string[] = [];
      let changed = false;
      setFavoriteAuthorIds((prev) => {
        previous = prev;
        const hasAuthor = prev.includes(authorId);

        if (shouldBeFavorite && !hasAuthor) {
          changed = true;
          return [...prev, authorId];
        }

        if (!shouldBeFavorite && hasAuthor) {
          changed = true;
          return prev.filter((id) => id !== authorId);
        }

        changed = false;
        return prev;
      });

      if (!changed) {
        return;
      }

      const request = shouldBeFavorite
        ? favoritesApi.add(accessToken, authorId)
        : favoritesApi.remove(accessToken, authorId);

      request.catch((error) => {
        console.error('[FavoritesProvider] Failed to sync favorite', error);
        setFavoriteAuthorIds(previous);
      });
    },
    [accessToken],
  );

  const clearFavorites = useCallback(() => {
    if (!accessToken) {
      setFavoriteAuthorIds([]);
      return;
    }

    const previous = favoriteAuthorIds;
    setFavoriteAuthorIds([]);

    favoritesApi.clear(accessToken).catch((error) => {
      console.error('[FavoritesProvider] Failed to clear favorites', error);
      setFavoriteAuthorIds(previous);
    });
  }, [accessToken, favoriteAuthorIds]);

  const favoriteSet = useMemo(
    () => new Set(favoriteAuthorIds),
    [favoriteAuthorIds],
  );

  const isFavorite = useCallback(
    (authorId: string) => favoriteSet.has(authorId),
    [favoriteSet],
  );

  const contextValue = useMemo(
    () => ({
      favoriteAuthorIds,
      toggleFavorite,
      setFavorite,
      clearFavorites,
      isFavorite,
    }),
    [favoriteAuthorIds, toggleFavorite, setFavorite, clearFavorites, isFavorite],
  );

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
}
