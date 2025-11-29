import { request } from '@/shared/api/request';

interface FavoritesResponse {
  favorites: string[];
}

interface FavoritePayload {
  targetUserId: string;
}

export const favoritesApi = {
  list(accessToken: string) {
    return request<FavoritesResponse>('/favorites', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  add(accessToken: string, targetUserId: string) {
    return request<{ favorite: FavoritePayload }>('/favorites', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ targetUserId }),
    });
  },

  remove(accessToken: string, targetUserId: string) {
    return request<void>(`/favorites/${targetUserId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  clear(accessToken: string) {
    return request<void>('/favorites', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
