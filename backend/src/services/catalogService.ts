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

export interface SkillCategory {
  id: number;
  name: string;
  subskills: Array<{
    id: number;
    name: string;
  }>;
}

type DbCity = (typeof db.cities)[number];
type DbSkill = (typeof db.skills)[number];
type DbSubskill = NonNullable<DbSkill['subskills']>[number];

const buildCityOptions = (): CityOption[] => {
  return db.cities.map((city: DbCity) => ({
    id: city.id,
    name: city.name,
  }));
};

const buildSkillGroups = (): SkillGroup[] => {
  return db.skills.map((group: DbSkill) => ({
    id: group.id,
    name: group.name,
    skills:
      group.subskills?.map((subskill: DbSubskill) => ({
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

  getSkillCategories(): SkillCategory[] {
    return db.skills.map((group: DbSkill) => ({
      id: group.id,
      name: group.name,
      subskills:
        group.subskills?.map((subskill: DbSubskill) => ({
          id: subskill.id,
          name: subskill.name,
        })) ?? [],
    }));
  },

  findSkillCategoryById(id: number): SkillCategory | null {
    const category = db.skills.find((skill: DbSkill) => skill.id === id);
    if (!category) {
      return null;
    }
    return {
      id: category.id,
      name: category.name,
      subskills:
        category.subskills?.map((subskill: DbSubskill) => ({
          id: subskill.id,
          name: subskill.name,
        })) ?? [],
    };
  },

  getCities(): CityOption[] {
    return buildCityOptions();
  },

  findCityById(id: number): CityOption | null {
    const city = db.cities.find((item: DbCity) => item.id === id);
    return city ? { id: city.id, name: city.name } : null;
  },
};
