import { mapApiToUser } from '@/entities/User/mappers';
import type { User, UserSkill } from '@/entities/User/types';
import type { Skill } from '@/entities/Skill/types';
import { getUserAge, getUserCity } from '@/entities/User/utils';
import { getSubskillNameMap } from '@/entities/Skill/mappers';
import { SkillCategories, type SkillCategory } from '@/shared/lib/constants';
import type {
  CityOption,
  Filters,
  SkillCategories as SkillGroup,
} from '@/features/Filter/types';
import { mapCityNamesToCityIds } from '@/features/Filter/utils';
import { usersApi } from '@/shared/api/users';
import type { ApiCatalogUser } from '@/shared/api/users';
import { loadFiltersBaseData } from '@/features/Filter/model/filterBaseDataStore';

export interface CatalogSkill extends Skill {
  originalSkillId: number;
  userSkillId: string;
  authorName: string;
  authorCity: string;
  authorAge: number;
  authorAbout?: string;
  category: SkillCategory;
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

const buildCategoryLookup = (skillGroups: SkillGroup[]): Map<number, SkillCategory> => {
  const categoryMap = new Map<number, SkillCategory>();

  skillGroups.forEach((category) => {
    const categoryValue =
      categoryNameToConstant.get(category.name) ?? SkillCategories.EDUCATION;

    category.skills.forEach((skill) => {
      categoryMap.set(skill.id, categoryValue);
    });
  });

  return categoryMap;
};

type CatalogReferenceMaps = {
  subskillNameById: Map<number, string>;
  categoryBySubskillId: Map<number, SkillCategory>;
  groupNameById: Map<number, string>;
  cityNameById: Map<number, string>;
};

const buildReferenceMaps = (
  skillGroups: SkillGroup[],
  cities: CityOption[],
): CatalogReferenceMaps => ({
  subskillNameById: getSubskillNameMap(skillGroups),
  categoryBySubskillId: buildCategoryLookup(skillGroups),
  groupNameById: new Map(skillGroups.map((group) => [group.id, group.name])),
  cityNameById: new Map(cities.map((city) => [city.id, city.name])),
});

const resolveSkillTitle = (
  skill: UserSkill,
  subskillId: number,
  subskillNameById: Map<number, string>,
): string => {
  const trimmed = skill.title.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return subskillNameById.get(subskillId) ?? 'Unknown skill';
};

const resolveSkillCategory = (
  skill: UserSkill,
  subskillId: number,
  categoryBySubskillId: Map<number, SkillCategory>,
  groupNameById: Map<number, string>,
): SkillCategory => {
  if (typeof skill.categoryId === 'number') {
    const groupName = groupNameById.get(skill.categoryId);
    if (groupName) {
      const mapped = categoryNameToConstant.get(groupName);
      if (mapped) {
        return mapped;
      }
    }
  }
  return categoryBySubskillId.get(subskillId) ?? SkillCategories.EDUCATION;
};

const resolveSkillImage = (
  skill: UserSkill,
  fallback?: string | null,
): string | undefined => {
  const primaryImage = skill.imageUrls.find((url) => url.trim().length > 0);
  if (primaryImage) {
    return primaryImage;
  }
  return fallback ?? undefined;
};

const resolveSkillGallery = (
  skill: UserSkill,
  fallback?: string | null,
): string[] => {
  const images = skill.imageUrls
    .map((url) => url.trim())
    .filter((url): url is string => url.length > 0);

  if (images.length) {
    return images;
  }

  if (fallback && fallback.trim().length > 0) {
    return [fallback];
  }

  return [];
};

export const buildCatalogSkills = (
  users: User[],
  referenceMaps: CatalogReferenceMaps,
): CatalogSkill[] =>
  users.flatMap((user) => {
    const { cityNameById } = referenceMaps;
    const authorCity = getUserCity(user, cityNameById);
    const authorAge = getUserAge(user);
    const authorAbout = user.bio ?? undefined;
    const { subskillNameById, categoryBySubskillId, groupNameById } = referenceMaps;

    const convertSkill = (
      skill: UserSkill,
      type: CatalogSkill['type'],
    ): CatalogSkill | null => {
      if (typeof skill.subcategoryId !== 'number') {
        return null;
      }

      const title = resolveSkillTitle(skill, skill.subcategoryId, subskillNameById);
      const category = resolveSkillCategory(
        skill,
        skill.subcategoryId,
        categoryBySubskillId,
        groupNameById,
      );
      const description = skill.description.trim() || authorAbout || '';
      const imageUrl = resolveSkillImage(skill, user.avatarUrl);
      const imageUrls = resolveSkillGallery(skill, user.avatarUrl);

      return {
        id: `${user.id}-${type}-${skill.subcategoryId}-${skill.id}`,
        title,
        description,
        type,
        category,
        imageUrl,
        authorAvatarUrl: user.avatarUrl ?? undefined,
        tags: [],
        imageUrls,
        authorId: user.id,
        isFavorite: false,
        originalSkillId: skill.subcategoryId,
        userSkillId: skill.id,
        authorName: user.name,
        authorCity,
        authorAge,
        authorAbout,
      };
    };

    const teachableSkills = (user.teachableSkills ?? [])
      .map((skill) => convertSkill(skill, 'teach'))
      .filter((skill): skill is CatalogSkill => Boolean(skill));

    const learningSkills = (user.learningSkills ?? [])
      .map((skill) => convertSkill(skill, 'learn'))
      .filter((skill): skill is CatalogSkill => Boolean(skill));

    return [...teachableSkills, ...learningSkills];
  });

export const loadCatalogBaseData = async (): Promise<CatalogBaseData> => {
  const response = await usersApi.fetchAll();
  const users = response.users.map((user: ApiCatalogUser) => mapApiToUser(user));
  const filtersBaseData = await loadFiltersBaseData();
  const referenceMaps = buildReferenceMaps(
    filtersBaseData.skillGroups,
    filtersBaseData.cities,
  );

  return {
    users,
    skills: buildCatalogSkills(users, referenceMaps),
    cityOptions: filtersBaseData.cities,
    skillGroups: filtersBaseData.skillGroups,
  };
};

export const createUsersMap = (users: User[]) =>
  new Map(users.map((user) => [user.id, user]));

interface FilterSkillsArgs {
  skills: CatalogSkill[];
  filters: Filters;
  cityOptions: CityOption[];
  usersById: Map<string, User>;
  searchQuery?: string;
}

export const filterCatalogSkills = ({
  skills,
  filters,
  cityOptions,
  usersById,
  searchQuery = '',
}: FilterSkillsArgs): CatalogSkill[] => {
  if (!skills.length) return [];

  const selectedCityIds = mapCityNamesToCityIds(cityOptions, filters.cities);
  const selectedSkillIds = new Set(filters.skillIds);
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return skills.filter((skill) => {
    const author = usersById.get(skill.authorId);
    if (!author) return false;

    if (filters.mode === 'wantToLearn' && skill.type !== 'teach') return false;
    if (filters.mode === 'canTeach' && skill.type !== 'learn') return false;

    if (filters.gender && author.gender !== filters.gender) return false;

    if (
      selectedCityIds.length &&
      !(
        typeof author.cityId === 'number' &&
        selectedCityIds.includes(author.cityId)
      )
    ) {
      return false;
    }

    if (
      selectedSkillIds.size &&
      !selectedSkillIds.has(skill.originalSkillId)
    ) {
      return false;
    }

    if (normalizedSearch) {
      const searchableText = [
        skill.title,
        skill.description,
        skill.authorName,
        skill.authorCity,
        author.bio ?? '',
        skill.tags?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });
};
