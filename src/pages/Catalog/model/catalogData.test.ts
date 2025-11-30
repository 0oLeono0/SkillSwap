import { filterCatalogSkills, type CatalogSkill } from './catalogData';
import type { CityOption } from '@/features/Filter/types';
import type { Filters } from '@/features/Filter/types';
import type { User } from '@/entities/User/types';
import { SkillCategories } from '@/shared/lib/constants';

const baseCities: CityOption[] = [
  { id: 1, name: 'Minsk' },
  { id: 2, name: 'Vilnius' },
];

const baseUsers: User[] = [
  {
    id: 'u1',
    name: 'Alice',
    role: 'user',
    gender: 'female' as unknown as User['gender'],
    cityId: 1,
    bio: 'I love cooking',
    teachableSkills: [],
    learningSkills: [],
  },
  {
    id: 'u2',
    name: 'Bob',
    role: 'user',
    gender: 'male' as unknown as User['gender'],
    cityId: 2,
    bio: 'Runner and swimmer',
    teachableSkills: [],
    learningSkills: [],
  },
];

const usersById = new Map(baseUsers.map((user) => [user.id, user]));

const catalogSkills: CatalogSkill[] = [
  {
    id: 's1',
    title: 'Bake bread',
    description: 'Home bakery basics',
    type: 'teach',
    category: SkillCategories.HOME,
    imageUrl: undefined,
    authorAvatarUrl: undefined,
    tags: ['food'],
    imageUrls: [],
    authorId: 'u1',
    isFavorite: false,
    originalSkillId: 10,
    userSkillId: 't1',
    authorName: 'Alice',
    authorCity: 'Minsk',
    authorAge: 22,
    authorAbout: 'Baker',
  },
  {
    id: 's2',
    title: 'Learn piano',
    description: 'Need a tutor',
    type: 'learn',
    category: SkillCategories.ART,
    imageUrl: undefined,
    authorAvatarUrl: undefined,
    tags: ['music'],
    imageUrls: [],
    authorId: 'u1',
    isFavorite: false,
    originalSkillId: 20,
    userSkillId: 'l1',
    authorName: 'Alice',
    authorCity: 'Minsk',
    authorAge: 22,
    authorAbout: 'Musician',
  },
  {
    id: 's3',
    title: 'Swimming',
    description: 'Freestyle coach',
    type: 'teach',
    category: SkillCategories.HEALTH,
    imageUrl: undefined,
    authorAvatarUrl: undefined,
    tags: ['sport'],
    imageUrls: [],
    authorId: 'u2',
    isFavorite: false,
    originalSkillId: 30,
    userSkillId: 't2',
    authorName: 'Bob',
    authorCity: 'Vilnius',
    authorAge: 30,
    authorAbout: 'Runner and swimmer',
  },
];

const baseFilters: Filters = {
  mode: 'all',
  gender: undefined,
  cities: [],
  skillIds: [],
};

describe('filterCatalogSkills', () => {
  it('returns empty array when there are no skills', () => {
    const result = filterCatalogSkills({
      skills: [],
      filters: baseFilters,
      cityOptions: baseCities,
      usersById,
      searchQuery: '',
    });

    expect(result).toEqual([]);
  });

  it('respects mode: wantToLearn shows teach skills only', () => {
    const result = filterCatalogSkills({
      skills: catalogSkills,
      filters: { ...baseFilters, mode: 'wantToLearn' },
      cityOptions: baseCities,
      usersById,
      searchQuery: '',
    });

    expect(result.map((skill) => skill.id)).toEqual(['s1', 's3']);
  });

  it('filters by gender and city', () => {
    const result = filterCatalogSkills({
      skills: catalogSkills,
      filters: {
        ...baseFilters,
        gender: 'male',
        cities: ['Vilnius'],
      },
      cityOptions: baseCities,
      usersById,
      searchQuery: '',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('s3');
  });

  it('filters by selected skill ids', () => {
    const result = filterCatalogSkills({
      skills: catalogSkills,
      filters: { ...baseFilters, skillIds: [20, 30] },
      cityOptions: baseCities,
      usersById,
      searchQuery: '',
    });

    expect(result.map((skill) => skill.id)).toEqual(['s2', 's3']);
  });

  it('applies search across title, description and author data', () => {
    const result = filterCatalogSkills({
      skills: catalogSkills,
      filters: baseFilters,
      cityOptions: baseCities,
      usersById,
      searchQuery: 'bakery',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('s1');
  });
});
