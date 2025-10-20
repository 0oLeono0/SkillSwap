import { AxiosError } from 'axios';
import type { ApiCity } from './types';
import { apiClient } from './apiClient';

export const citiesApi = {
  async fetchAllCities(): Promise<ApiCity[]> {
    try {
      const response = await apiClient.get<ApiCity[]>('/cities');
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке списка городов:', error);
      throw error;
    }
  },

  async fetchCityById(id: ApiCity['id']): Promise<ApiCity> {
    try {
      const response = await apiClient.get<ApiCity>(`/cities/${id}`);

      if (!response.data) {
        throw new AxiosError(`Город с id=${id} не найден`);
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError)
        console.error(`Ошибка при загрузке города id=${id}:`, error.message);
      throw error;
    }
  }
};
