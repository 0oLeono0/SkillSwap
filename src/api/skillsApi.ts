import { AxiosError } from 'axios';
import type { ApiSkillCategory } from './types';
import { apiClient } from './apiClient';

export const skillsApi = {
  async fetchAllCategories(): Promise<ApiSkillCategory[]> {
    const response = await apiClient.get<ApiSkillCategory[]>('/skills');
    return response.data;
  },

  async fetchCategoryById(id: ApiSkillCategory['id']): Promise<ApiSkillCategory> {
    const response = await apiClient.get<ApiSkillCategory>(`/skills/${id}`);
    if (!response.data) {
      throw new AxiosError(`Skill category with id=${id} not found`, 'ERR_BAD_RESPONSE');
    }
    return response.data;
  },
};
