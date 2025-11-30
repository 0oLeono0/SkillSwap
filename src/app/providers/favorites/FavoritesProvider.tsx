import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { FavoritesContext } from './context';
import { useAuth } from '@/app/providers/auth';
import { favoritesApi } from '@/shared/api/favorites';

interface FavoritesProviderProps {
  children: ReactNode;
}

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { accessToken } = useAuth();
  const [favoriteAuthorIds, setFavoriteAuthorIds] = useState<string[]>([]);
  const favoritesRef = useRef<string[]>([]);

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

  useEffect(() => {
    favoritesRef.current = favoriteAuthorIds;
  }, [favoriteAuthorIds]);

  const applyOptimisticUpdate = useCallback(
    (updater: (prev: string[]) => string[]) => {
      let rollback: string[] = favoritesRef.current;
      let applied: string[] = favoritesRef.current;

      setFavoriteAuthorIds((prev) => {
        rollback = prev;
        applied = updater(prev);
        return applied;
      });

      return { rollback, applied };
    },
    [],
  );

  const toggleFavorite = useCallback(
    (authorId: string) => {
      if (!accessToken) {
        console.warn('[FavoritesProvider] toggleFavorite requires auth');
        return;
      }

      const { rollback, applied } = applyOptimisticUpdate((prev) => {
        const shouldFavorite = !prev.includes(authorId);
        return shouldFavorite
          ? [...prev, authorId]
          : prev.filter((id) => id !== authorId);
      });

      const shouldFavorite = applied.includes(authorId);

      const request = shouldFavorite
        ? favoritesApi.add(accessToken, authorId)
        : favoritesApi.remove(accessToken, authorId);

      request.catch((error) => {
        console.error('[FavoritesProvider] Failed to sync favorite', error);
      setFavoriteAuthorIds((current) =>
          arraysEqual(current, applied) ? rollback : current,
        );
      });
    },
    [accessToken, applyOptimisticUpdate],
  );

  const setFavorite = useCallback(
    (authorId: string, shouldBeFavorite: boolean) => {
      if (!accessToken) {
        console.warn('[FavoritesProvider] setFavorite requires auth');
        return;
      }

      const { rollback, applied } = applyOptimisticUpdate((prev) => {
        const hasAuthor = prev.includes(authorId);

        if (shouldBeFavorite && !hasAuthor) {
          return [...prev, authorId];
        }

        if (!shouldBeFavorite && hasAuthor) {
          return prev.filter((id) => id !== authorId);
        }

        return prev;
      });

      if (arraysEqual(rollback, applied)) return;

      const request = shouldBeFavorite
        ? favoritesApi.add(accessToken, authorId)
        : favoritesApi.remove(accessToken, authorId);

      request.catch((error) => {
        console.error('[FavoritesProvider] Failed to sync favorite', error);
        setFavoriteAuthorIds((current) =>
          arraysEqual(current, applied) ? rollback : current,
        );
      });
    },
    [accessToken, applyOptimisticUpdate],
  );

  const clearFavorites = useCallback(() => {
    if (!accessToken) {
      setFavoriteAuthorIds([]);
      return;
    }

    const { rollback, applied } = applyOptimisticUpdate(() => []);

    favoritesApi.clear(accessToken).catch((error) => {
      console.error('[FavoritesProvider] Failed to clear favorites', error);
      setFavoriteAuthorIds((current) =>
        arraysEqual(current, applied) ? rollback : current,
      );
    });
  }, [accessToken, applyOptimisticUpdate]);

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
