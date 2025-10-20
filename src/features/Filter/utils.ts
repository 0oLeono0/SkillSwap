import type { CityOption, Filters, SkillCategories } from './types.ts';
import { db } from '@/api/mockData.ts';

//TODO взять данные через API
export const getCities = () => {
  return db.cities.map(({ id, name }) => ({ id, name }));
};

//TODO взять данные через API
export const getSkillsGroups = () => {
  return db.skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    skills: skill.subskills?.map(sub => ({
      id: sub.id,
      name: sub.name
    })) ?? []
  }));
};

export const countActiveFilters = (filters: Filters): number => {
  let count = 0;

  if (filters.mode !== 'all') {
    count++;
  }
  if (filters.gender) {
    count++;
  }
  if (filters.cities.length > 0) {
    count += filters.cities.length;
  }
  if (filters.skillIds.length > 0) {
    count += filters.skillIds.length;
  }

  return count;
};

export const mapCityIdsToCityNames = (cityOptions: CityOption[], cityIds: number[]) => {
  return cityOptions
    .filter(city => cityIds.includes(city.id))
    .map(city => city.name);
};

export const mapCityNamesToCityIds = (cityOptions: CityOption[], cityNames: string[]) => {
  return cityOptions
    .filter(city => cityNames.includes(city.name))
    .map(city => city.id);
};

export const selectedSkillsByGroup = (group: SkillCategories, skillIds: number[]) => {
  return skillIds
    .filter(id => group.skills.some(skill => skill.id === id));
};

export const collectSkillIds = (
  categories: SkillCategories[],
  selectedSkillIds: number[],
  categoryId: number,
  skillIds: number[]) => {
  const otherCategorySelected = categories
    .filter(category => category.id !== categoryId)
    .flatMap(category => selectedSkillIds.filter(id => category.skills.some(s => s.id === id)));

  return [...otherCategorySelected, ...skillIds];
};