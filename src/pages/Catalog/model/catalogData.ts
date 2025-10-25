import { db } from '@/api/mockData';
import { mapApiToUser } from '@/entities/User/mappers';
import type { User } from '@/entities/User/types';
import type { Skill } from '@/entities/Skill/types';
import { getUserAge, getUserCity } from '@/entities/User/utils';
import { getSubskillNameMap } from '@/entities/Skill/mappers';
import { SkillCategories, type SkillCategory } from '@/shared/lib/constants';
import type {
  CityOption,
  Filters,
  SkillCategories as SkillGroup,
} from '@/features/Filter/types';
import {
    getCities,
    getSkillsGroups,
    mapCityNamesToCityIds,
} from '@/features/Filter/utils';

export interface CatalogSkill extends Skill {
  originalSkillId: number;
  authorName: string;
  authorCity: string;
  authorAge: number;
  authorAbout?: string;
}

export interface CatalogBaseData {
  users: User[];
  skills: CatalogSkill[];
  cityOptions: CityOption[];
  skillGroups: SkillGroup[];
}

export const DEFAULT_FILTERS: Filters = {
  mode: 'all',
  gender: undefined,
  cities: [],
  skillIds: [],
};

const categoryNameToConstant = new Map<string, SkillCategory>(
  Object.values(SkillCategories).map((value) => [value, value]),
);

const buildCategoryLookup = (): Map<number, SkillCategory> => {
  const categoryMap = new Map<number, SkillCategory>();

  db.skills.forEach((category) => {
    const categoryValue =
      categoryNameToConstant.get(category.name) ?? SkillCategories.EDUCATION;

    category.subskills.forEach((subskill) => {
      categoryMap.set(subskill.id, categoryValue);
    });
  });

  return categoryMap;
};

const subskillNameById = getSubskillNameMap(db.skills);
const categoryBySubskillId = buildCategoryLookup();

export const buildCatalogSkills = (users: User[]): CatalogSkill[] => {
  return users.flatMap((user) => {
    const authorCity = getUserCity(user);
    const authorAge = getUserAge(user);
    const authorAbout = user.bio;

    const convertSkill = (
      subskillId: number,
      type: CatalogSkill['type'],
    ): CatalogSkill => {
      const title = subskillNameById.get(subskillId) ?? 'Неизвестный навык';
      const category =
        categoryBySubskillId.get(subskillId) ?? SkillCategories.EDUCATION;

      return {
        id: `${user.id}-${type}-${subskillId}`,
        title,
        description: authorAbout ?? '',
        type,
        category,
        imageUrl: user.avatarUrl,
        tags: [],
        authorId: user.id,
        isFavorite: false,
        originalSkillId: subskillId,
        authorName: user.name,
        authorCity,
        authorAge,
        authorAbout,
      };
    };

    const teachableSkills = user.teachableSkills.map((skillId) =>
      convertSkill(skillId, 'teach'),
    );
    const learningSkills = user.learningSkills.map((skillId) =>
      convertSkill(skillId, 'learn'),
    );

    return [...teachableSkills, ...learningSkills];
  });
};

export const loadCatalogBaseData = (): CatalogBaseData => {
  const users = db.users.map(mapApiToUser);
  return {
    users,
    skills: buildCatalogSkills(users),
    cityOptions: getCities(),
    skillGroups: getSkillsGroups(),
  };
};

export const createUsersMap = (users: User[]) =>
  new Map(users.map((user) => [user.id, user]));

interface FilterSkillsArgs {
  skills: CatalogSkill[];
  filters: Filters;
  cityOptions: CityOption[];
  usersById: Map<number, User>;
}

export const filterCatalogSkills = ({
  skills,
  filters,
  cityOptions,
  usersById,
}: FilterSkillsArgs): CatalogSkill[] => {
  if (!skills.length) return [];

  const selectedCityIds = mapCityNamesToCityIds(cityOptions, filters.cities);
  const selectedSkillIds = new Set(filters.skillIds);

  return skills.filter((skill) => {
    const author = usersById.get(skill.authorId);
    if (!author) return false;

    if (filters.mode === 'wantToLearn' && skill.type !== 'teach') return false;
    if (filters.mode === 'canTeach' && skill.type !== 'learn') return false;

    if (filters.gender && author.gender !== filters.gender) return false;

    if (
      selectedCityIds.length &&
      !selectedCityIds.includes(author.cityId)
    ) {
      return false;
    }

    if (
      selectedSkillIds.size &&
      !selectedSkillIds.has(skill.originalSkillId)
    ) {
      return false;
    }

    return true;
  });
};
