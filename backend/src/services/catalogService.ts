import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { parseImageUrls } from '../types/userSkill.js';

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

const DEFAULT_CATEGORY_NAME = 'Образование и развитие';

export interface CatalogSkill {
  id: string;
  title: string;
  description: string;
  type: 'teach' | 'learn';
  category: string;
  categoryId: number | null;
  imageUrl?: string;
  imageUrls?: string[];
  authorAvatarUrl?: string;
  tags: string[];
  authorId: string;
  isFavorite?: boolean;
  originalSkillId: number;
  userSkillId: string;
  authorName: string;
  authorCity: string;
  authorAge: number;
  authorAbout?: string;
}

export interface CatalogSearchResponse {
  skills: CatalogSkill[];
  page: number;
  pageSize: number;
  totalAuthors: number;
}

export interface CatalogSearchOptions {
  mode?: 'all' | 'wantToLearn' | 'canTeach';
  gender?: string;
  cityIds?: number[];
  skillIds?: number[];
  categoryIds?: number[];
  authorIds?: string[];
  excludeAuthorId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

const mapCity = (city: NamedEntity): CityOption => ({
  id: city.id,
  name: city.name
});

const mapSkillGroup = (group: SkillGroupRecord): SkillGroup => ({
  id: group.id,
  name: group.name,
  skills: group.skills.map((skill) => ({ id: skill.id, name: skill.name }))
});

const mapSkillCategory = (group: SkillGroupRecord): SkillCategory => ({
  id: group.id,
  name: group.name,
  subskills: group.skills.map((skill) => ({ id: skill.id, name: skill.name }))
});

const listCities = async (): Promise<NamedEntity[]> =>
  prisma.city.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      id: 'asc'
    }
  });

const listSkillGroups = async (): Promise<SkillGroupRecord[]> =>
  prisma.skillGroup.findMany({
    select: {
      id: true,
      name: true,
      skills: {
        select: {
          id: true,
          name: true
        },
        orderBy: {
          id: 'asc'
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

const getAge = (birthDate?: Date | null): number => {
  if (!birthDate) {
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
};

const buildCatalogSkillId = (
  userId: string,
  type: string,
  subcategoryId: number,
  userSkillId: string
) => `${userId}-${type}-${subcategoryId}-${userSkillId}`;

const resolveSkillTitle = (title: string, fallback?: string | null) => {
  const trimmed = title.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return fallback?.trim() || 'Unknown skill';
};

const resolveSkillCategoryName = (
  categoryName?: string | null,
  fallback?: string | null
) => categoryName?.trim() || fallback?.trim() || DEFAULT_CATEGORY_NAME;

const resolvePrimaryImage = (images: string[], fallback?: string | null) =>
  images.find((url) => url.trim().length > 0) || fallback?.trim() || undefined;

const resolveGalleryImages = (images: string[], fallback?: string | null) => {
  if (images.length > 0) {
    return images;
  }

  if (fallback && fallback.trim().length > 0) {
    return [fallback.trim()];
  }

  return [];
};

type CatalogSkillRecord = Prisma.UserSkillGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        avatarUrl: true;
        bio: true;
        birthDate: true;
        city: { select: { name: true } };
      };
    };
    category: { select: { id: true; name: true } };
    subcategory: {
      select: {
        id: true;
        name: true;
        groupId: true;
        group: { select: { id: true; name: true } };
      };
    };
  };
}>;

const mapCatalogSkill = (record: CatalogSkillRecord): CatalogSkill | null => {
  if (typeof record.subcategoryId !== 'number') {
    return null;
  }

  const user = record.user;
  const subcategoryName = record.subcategory?.name ?? '';
  const categoryName = resolveSkillCategoryName(
    record.category?.name,
    record.subcategory?.group?.name
  );
  const categoryId =
    typeof record.categoryId === 'number'
      ? record.categoryId
      : (record.subcategory?.groupId ?? null);

  const imageUrls = parseImageUrls(record.imageUrls);
  const imageUrl = resolvePrimaryImage(imageUrls, user.avatarUrl);
  const authorAvatarUrl = user.avatarUrl?.trim();
  const authorAbout = user.bio?.trim();

  const payload: CatalogSkill = {
    id: buildCatalogSkillId(
      user.id,
      record.type,
      record.subcategoryId,
      record.id
    ),
    title: resolveSkillTitle(record.title, subcategoryName),
    description: record.description.trim() || user.bio?.trim() || '',
    type: record.type === 'learn' ? 'learn' : 'teach',
    category: categoryName,
    categoryId,
    imageUrls: resolveGalleryImages(imageUrls, user.avatarUrl),
    tags: [],
    authorId: user.id,
    isFavorite: false,
    originalSkillId: record.subcategoryId,
    userSkillId: record.id,
    authorName: user.name,
    authorCity: user.city?.name ?? '',
    authorAge: getAge(user.birthDate)
  };

  if (imageUrl) {
    payload.imageUrl = imageUrl;
  }

  if (authorAvatarUrl && authorAvatarUrl.length > 0) {
    payload.authorAvatarUrl = authorAvatarUrl;
  }

  if (authorAbout && authorAbout.length > 0) {
    payload.authorAbout = authorAbout;
  }

  return payload;
};

export const catalogService = {
  async getFiltersBaseData() {
    const [cities, skillGroups] = await Promise.all([
      listCities(),
      listSkillGroups()
    ]);

    return {
      cities: cities.map(mapCity),
      skillGroups: skillGroups.map(mapSkillGroup)
    };
  },

  async searchCatalogSkills(
    options: CatalogSearchOptions = {}
  ): Promise<CatalogSearchResponse> {
    const pageSize = Math.max(
      1,
      Number.isFinite(options.pageSize) ? options.pageSize! : 12
    );
    const page = Math.max(1, Number.isFinite(options.page) ? options.page! : 1);
    const search = options.search?.trim();

    const cityIds = (options.cityIds ?? []).filter((value) =>
      Number.isFinite(value)
    );
    const skillIds = (options.skillIds ?? []).filter((value) =>
      Number.isFinite(value)
    );
    const categoryIds = (options.categoryIds ?? []).filter((value) =>
      Number.isFinite(value)
    );

    const rawAuthorIds = (options.authorIds ?? [])
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const authorIds =
      options.excludeAuthorId && rawAuthorIds.length
        ? rawAuthorIds.filter((id) => id !== options.excludeAuthorId)
        : rawAuthorIds;

    if (rawAuthorIds.length && authorIds.length === 0) {
      return { skills: [], page, pageSize, totalAuthors: 0 };
    }

    const mode = options.mode ?? 'all';
    const skillType =
      mode === 'wantToLearn' ? 'teach' : mode === 'canTeach' ? 'learn' : null;

    const skillFilters: Prisma.UserSkillWhereInput = {
      subcategoryId: { not: null }
    };

    if (skillType) {
      skillFilters.type = skillType;
    }

    if (skillIds.length) {
      skillFilters.subcategoryId = { in: skillIds };
    }

    if (categoryIds.length) {
      const categoryFilter: Prisma.UserSkillWhereInput = {
        OR: [
          { categoryId: { in: categoryIds } },
          { subcategory: { groupId: { in: categoryIds } } }
        ]
      };
      const existingAnd = Array.isArray(skillFilters.AND)
        ? skillFilters.AND
        : skillFilters.AND
          ? [skillFilters.AND]
          : [];
      skillFilters.AND = [...existingAnd, categoryFilter];
    }

    const userWhere: Prisma.UserWhereInput = {
      userSkills: {
        some: skillFilters
      }
    };

    if (options.gender) {
      userWhere.gender = options.gender;
    }

    if (cityIds.length) {
      userWhere.cityId = { in: cityIds };
    }

    if (authorIds.length) {
      userWhere.id = { in: authorIds };
    } else if (options.excludeAuthorId) {
      userWhere.NOT = { id: options.excludeAuthorId };
    }

    if (search) {
      const skillSearchFilters: Prisma.UserSkillWhereInput = {
        ...skillFilters,
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { subcategory: { name: { contains: search } } }
        ]
      };

      userWhere.AND = [
        {
          OR: [
            { name: { contains: search } },
            { bio: { contains: search } },
            { city: { name: { contains: search } } },
            { userSkills: { some: skillSearchFilters } }
          ]
        }
      ];
    }

    const totalAuthors = await prisma.user.count({ where: userWhere });

    if (totalAuthors === 0) {
      return { skills: [], page, pageSize, totalAuthors };
    }

    const authors = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const pageAuthorIds = authors.map((author) => author.id);

    if (pageAuthorIds.length === 0) {
      return { skills: [], page, pageSize, totalAuthors };
    }

    const skills = await prisma.userSkill.findMany({
      where: {
        ...skillFilters,
        userId: { in: pageAuthorIds }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            birthDate: true,
            city: { select: { name: true } }
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            groupId: true,
            group: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const authorOrder = new Map(pageAuthorIds.map((id, index) => [id, index]));
    const typeOrder = { teach: 0, learn: 1 } as const;

    const sorted = [...skills].sort((left, right) => {
      const leftOrder = authorOrder.get(left.userId) ?? 0;
      const rightOrder = authorOrder.get(right.userId) ?? 0;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      const leftType = left.type === 'learn' ? 'learn' : 'teach';
      const rightType = right.type === 'learn' ? 'learn' : 'teach';
      return typeOrder[leftType] - typeOrder[rightType];
    });

    const mapped = sorted
      .map((record) => mapCatalogSkill(record))
      .filter((skill): skill is CatalogSkill => Boolean(skill));

    return {
      skills: mapped,
      page,
      pageSize,
      totalAuthors
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
            name: true
          },
          orderBy: {
            id: 'asc'
          }
        }
      }
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
        name: true
      }
    });
    return city ? mapCity(city) : null;
  }
};
