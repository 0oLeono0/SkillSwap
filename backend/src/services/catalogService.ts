import { db } from '../data/mockData.js';

export interface CityOption {
  id: number;
  name: string;
}

export interface SkillGroup {
  id: number;
  name: string;
  skills: Array<{
    id: number;
    name: string;
  }>;
}

const buildCityOptions = (): CityOption[] => {
  return db.cities.map((city) => ({
    id: city.id,
    name: city.name,
  }));
};

const buildSkillGroups = (): SkillGroup[] => {
  return db.skills.map((group) => ({
    id: group.id,
    name: group.name,
    skills:
      group.subskills?.map((subskill) => ({
        id: subskill.id,
        name: subskill.name,
      })) ?? [],
  }));
};

export const catalogService = {
  getFiltersBaseData() {
    return {
      cities: buildCityOptions(),
      skillGroups: buildSkillGroups(),
    };
  },
};
