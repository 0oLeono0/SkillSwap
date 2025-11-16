import { request } from './request';

interface FavoritesResponse {
  favorites: string[];
}

interface FavoritePayload {
  targetUserId: string;
}

export const favoritesApi = {
  list(accessToken: string) {
    return request<FavoritesResponse>('/api/favorites', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  add(accessToken: string, targetUserId: string) {
    return request<{ favorite: FavoritePayload }>('/api/favorites', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ targetUserId }),
    });
  },

  remove(accessToken: string, targetUserId: string) {
    return request<void>(`/api/favorites/${targetUserId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  clear(accessToken: string) {
    return request<void>('/api/favorites', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
