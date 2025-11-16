import { createContext } from 'react';

export interface FavoritesContextValue {
  favoriteAuthorIds: string[];
  toggleFavorite: (authorId: string) => void;
  isFavorite: (authorId: string) => boolean;
  setFavorite: (authorId: string, shouldBeFavorite: boolean) => void;
  clearFavorites: () => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);
