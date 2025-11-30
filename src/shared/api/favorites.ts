import { authorizedRequest } from '@/shared/api/request';

interface FavoritesResponse {
  favorites: string[];
}

interface FavoritePayload {
  targetUserId: string;
}

export const favoritesApi = {
  list(accessToken: string) {
    return authorizedRequest<FavoritesResponse>('/favorites', accessToken);
  },

  add(accessToken: string, targetUserId: string) {
    return authorizedRequest<{ favorite: FavoritePayload }>('/favorites', accessToken, {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  },

  remove(accessToken: string, targetUserId: string) {
    return authorizedRequest<void>(`/favorites/${targetUserId}`, accessToken, {
      method: 'DELETE',
    });
  },

  clear(accessToken: string) {
    return authorizedRequest<void>('/favorites', accessToken, {
      method: 'DELETE',
    });
  },
};
