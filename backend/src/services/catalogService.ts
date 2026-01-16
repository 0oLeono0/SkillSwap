import { prisma } from '../lib/prisma.js';

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

type NamedEntity = { id: number; name: string };
type SkillGroupRecord = {
  id: number;
  name: string;
  skills: NamedEntity[];
};

const mapCity = (city: NamedEntity): CityOption => ({
  id: city.id,
  name: city.name,
});

const mapSkillGroup = (group: SkillGroupRecord): SkillGroup => ({
  id: group.id,
  name: group.name,
  skills: group.skills.map((skill) => ({ id: skill.id, name: skill.name })),
});

const mapSkillCategory = (group: SkillGroupRecord): SkillCategory => ({
  id: group.id,
  name: group.name,
  subskills: group.skills.map((skill) => ({ id: skill.id, name: skill.name })),
});

const listCities = async (): Promise<NamedEntity[]> =>
  prisma.city.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

const listSkillGroups = async (): Promise<SkillGroupRecord[]> =>
  prisma.skillGroup.findMany({
    select: {
      id: true,
      name: true,
      skills: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          id: 'asc',
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

export const catalogService = {
  async getFiltersBaseData() {
    const [cities, skillGroups] = await Promise.all([
      listCities(),
      listSkillGroups(),
    ]);

    return {
      cities: cities.map(mapCity),
      skillGroups: skillGroups.map(mapSkillGroup),
    };
  },

  async getSkillCategories(): Promise<SkillCategory[]> {
    const skillGroups = await listSkillGroups();
    return skillGroups.map(mapSkillCategory);
  },

  async findSkillCategoryById(id: number): Promise<SkillCategory | null> {
    const group = await prisma.skillGroup.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        skills: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });
    if (!group) {
      return null;
    }
    return mapSkillCategory(group);
  },

  async getCities(): Promise<CityOption[]> {
    const cities = await listCities();
    return cities.map(mapCity);
  },

  async findCityById(id: number): Promise<CityOption | null> {
    const city = await prisma.city.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
    return city ? mapCity(city) : null;
  },
};
