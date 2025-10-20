import { AxiosError } from 'axios';
import type { ApiSkillCategory } from './types';
import { apiClient } from './apiClient';

export const skillsApi = {
  async fetchAllCategories(): Promise<ApiSkillCategory[]> {
    try {
      const response = await apiClient.get<ApiSkillCategory[]>('/skills');
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке списка навыков:', error);
      throw error;
    }
  },

  async fetchCategoryById(
    id: ApiSkillCategory['id']
  ): Promise<Promise<ApiSkillCategory>> {
    try {
      const response = await apiClient.get<ApiSkillCategory>(`/skills/${id}`);
      if (!response.data) {
        throw new AxiosError(`Категория навыков с id=${id} не найден`);
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError)
        console.error(
          `Ошибка при загрузке категории навыков ${id}:`,
          error.message
        );
      throw error;
    }
  }
};
