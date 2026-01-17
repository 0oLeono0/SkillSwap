import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type SkillRecord = {
  id: string;
  title: string;
  description: string;
  type: string;
  imageUrls: string[];
  subcategoryId: number;
  categoryId: number | null;
  category: { id: number; name: string } | null;
  subcategory: {
    id: number;
    name: string;
    groupId: number;
    group: { id: number; name: string };
  } | null;
};

type UserRecord = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  birthDate: Date | null;
  city: { name: string } | null;
  userSkills: SkillRecord[];
};

const mockPrisma = {
  user: {
    count: jest.fn<(args: unknown) => Promise<number>>(),
    findMany: jest.fn<(args: unknown) => Promise<UserRecord[]>>()
  }
};

jest.unstable_mockModule('../src/lib/prisma.js', () => ({
  prisma: mockPrisma
}));

const { catalogService } = await import('../src/services/catalogService.js');

describe('catalogService.searchCatalogSkills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies skill filters when loading skills for page authors', async () => {
    mockPrisma.user.count.mockResolvedValue(1);
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 'author-1',
        name: 'Author',
        avatarUrl: null,
        bio: null,
        birthDate: new Date('2000-01-01'),
        city: { name: 'City' },
        userSkills: [
          {
            id: 'skill-1',
            title: 'Skill',
            description: 'Desc',
            type: 'teach',
            imageUrls: [],
            subcategoryId: 11,
            categoryId: 5,
            category: { id: 5, name: 'Group' },
            subcategory: {
              id: 11,
              name: 'Sub',
              groupId: 5,
              group: { id: 5, name: 'Group' }
            }
          }
        ]
      }
    ]);

    await catalogService.searchCatalogSkills({
      mode: 'wantToLearn',
      skillIds: [11],
      categoryIds: [5],
      page: 1,
      pageSize: 1
    });

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userSkills: {
            some: expect.objectContaining({
              type: 'teach',
              subcategoryId: { in: [11] },
              AND: [
                {
                  OR: [
                    { categoryId: { in: [5] } },
                    { subcategory: { groupId: { in: [5] } } }
                  ]
                }
              ]
            })
          }
        }),
        select: expect.objectContaining({
          userSkills: expect.objectContaining({
            where: expect.objectContaining({
              type: 'teach',
              subcategoryId: { in: [11] },
              AND: [
                {
                  OR: [
                    { categoryId: { in: [5] } },
                    { subcategory: { groupId: { in: [5] } } }
                  ]
                }
              ]
            })
          })
        })
      })
    );
  });
});
