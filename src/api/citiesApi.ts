import { AxiosError } from 'axios';
import type { ApiCity } from './types';
import { apiClient } from './apiClient';

export const citiesApi = {
  async fetchAllCities(): Promise<ApiCity[]> {
    const response = await apiClient.get<ApiCity[]>('/cities');
    return response.data;
  },

  async fetchCityById(id: ApiCity['id']): Promise<ApiCity> {
    const response = await apiClient.get<ApiCity>(`/cities/${id}`);

    if (!response.data) {
      throw new AxiosError(`City with id=${id} not found`, 'ERR_BAD_RESPONSE');
    }
    return response.data;
  },
};
