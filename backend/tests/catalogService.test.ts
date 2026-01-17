import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type UserRecord = { id: string };

const mockPrisma = {
  user: {
    count: jest.fn<(args: unknown) => Promise<number>>(),
    findMany: jest.fn<(args: unknown) => Promise<UserRecord[]>>()
  },
  userSkill: {
    findMany: jest.fn<(args: unknown) => Promise<unknown[]>>()
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
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'author-1' }]);
    mockPrisma.userSkill.findMany.mockResolvedValue([
      {
        id: 'skill-1',
        title: 'Skill',
        description: 'Desc',
        type: 'teach',
        imageUrls: [],
        subcategoryId: 11,
        categoryId: 5,
        userId: 'author-1',
        user: {
          id: 'author-1',
          name: 'Author',
          avatarUrl: null,
          bio: null,
          birthDate: new Date('2000-01-01'),
          city: { name: 'City' }
        },
        category: { id: 5, name: 'Group' },
        subcategory: {
          id: 11,
          name: 'Sub',
          groupId: 5,
          group: { id: 5, name: 'Group' }
        }
      }
    ]);

    await catalogService.searchCatalogSkills({
      mode: 'wantToLearn',
      skillIds: [11],
      categoryIds: [5],
      page: 1,
      pageSize: 1
    });

    expect(mockPrisma.userSkill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: { in: ['author-1'] },
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
    );
  });
});
