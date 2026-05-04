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
  status: string;
  avatarUrl: string | null;
  bio: string | null;
  birthDate: Date | null;
  city: { name: string } | null;
  userSkills: SkillRecord[];
};

const mockPrisma = {
  user: {
    count: jest.fn<(args: unknown) => Promise<number>>(),
    findMany: jest.fn<(args: unknown) => Promise<unknown[]>>()
  },
  exchange: {
    groupBy: jest.fn<(args: unknown) => Promise<unknown[]>>()
  },
  exchangeRating: {
    groupBy: jest.fn<(args: unknown) => Promise<unknown[]>>()
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

  const buildUserRecord = (
    overrides: Partial<UserRecord> = {}
  ): UserRecord => ({
    id: 'author-1',
    name: 'Author',
    status: 'active',
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
    ],
    ...overrides
  });

  it('applies skill filters when loading skills for page authors', async () => {
    mockPrisma.user.count.mockResolvedValue(1);
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 'author-1',
        name: 'Author',
        status: 'inactive',
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

  it('maps user status to catalog author', async () => {
    mockPrisma.user.count.mockResolvedValue(1);
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 'author-1',
        name: 'Author',
        status: 'inactive',
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

    const result = await catalogService.searchCatalogSkills();

    expect(result.authors[0]).toMatchObject({
      id: 'author-1',
      status: 'inactive'
    });
  });

  it('sorts catalog authors by average rating and keeps unrated users lower', async () => {
    mockPrisma.user.count.mockResolvedValue(3);
    mockPrisma.user.findMany
      .mockResolvedValueOnce([
        { id: 'author-low', createdAt: new Date('2026-04-30') },
        { id: 'author-unrated', createdAt: new Date('2026-04-29') },
        { id: 'author-high', createdAt: new Date('2026-04-28') }
      ])
      .mockResolvedValueOnce([
        buildUserRecord({ id: 'author-low', name: 'Low' }),
        buildUserRecord({ id: 'author-high', name: 'High' })
      ]);
    mockPrisma.exchangeRating.groupBy.mockResolvedValue([
      {
        ratedUserId: 'author-low',
        _avg: { score: 3.5 }
      },
      {
        ratedUserId: 'author-high',
        _avg: { score: 4.8 }
      }
    ]);

    const result = await catalogService.searchCatalogSkills({
      sortBy: 'rating',
      page: 1,
      pageSize: 2
    });

    expect(mockPrisma.exchangeRating.groupBy).toHaveBeenCalledWith({
      by: ['ratedUserId'],
      where: {
        ratedUserId: {
          in: ['author-low', 'author-unrated', 'author-high']
        }
      },
      _avg: {
        score: true
      }
    });
    expect(mockPrisma.user.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            expect.objectContaining({
              userSkills: {
                some: {
                  subcategoryId: { not: null }
                }
              }
            }),
            { id: { in: ['author-high', 'author-low'] } }
          ]
        }
      })
    );
    expect(result.authors.map((author) => author.id)).toEqual([
      'author-high',
      'author-low'
    ]);
  });

  it('sorts catalog authors by completed exchange count for activity period', async () => {
    mockPrisma.user.count.mockResolvedValue(3);
    mockPrisma.user.findMany
      .mockResolvedValueOnce([
        { id: 'author-new', createdAt: new Date('2026-04-30') },
        { id: 'author-low', createdAt: new Date('2026-04-29') },
        { id: 'author-high', createdAt: new Date('2026-04-28') }
      ])
      .mockResolvedValueOnce([
        buildUserRecord({ id: 'author-low', name: 'Low' }),
        buildUserRecord({ id: 'author-high', name: 'High' })
      ]);
    mockPrisma.exchange.groupBy
      .mockResolvedValueOnce([
        {
          initiatorId: 'author-low',
          _count: { _all: 1 }
        },
        {
          initiatorId: 'author-high',
          _count: { _all: 2 }
        }
      ])
      .mockResolvedValueOnce([
        {
          recipientId: 'author-high',
          _count: { _all: 1 }
        }
      ]);

    const result = await catalogService.searchCatalogSkills({
      activityPeriod: 'allTime',
      page: 1,
      pageSize: 2
    });

    expect(mockPrisma.exchange.groupBy).toHaveBeenNthCalledWith(1, {
      by: ['initiatorId'],
      where: {
        status: 'completed',
        OR: [
          { initiatorId: { in: ['author-new', 'author-low', 'author-high'] } },
          { recipientId: { in: ['author-new', 'author-low', 'author-high'] } }
        ]
      },
      _count: {
        _all: true
      }
    });
    expect(mockPrisma.exchange.groupBy).toHaveBeenNthCalledWith(2, {
      by: ['recipientId'],
      where: {
        status: 'completed',
        OR: [
          { initiatorId: { in: ['author-new', 'author-low', 'author-high'] } },
          { recipientId: { in: ['author-new', 'author-low', 'author-high'] } }
        ]
      },
      _count: {
        _all: true
      }
    });
    expect(mockPrisma.user.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            expect.objectContaining({
              userSkills: {
                some: {
                  subcategoryId: { not: null }
                }
              }
            }),
            { id: { in: ['author-high', 'author-low'] } }
          ]
        }
      })
    );
    expect(result.authors.map((author) => author.id)).toEqual([
      'author-high',
      'author-low'
    ]);
  });

  it.each([
    ['day', 1],
    ['week', 7],
    ['month', 'month'],
    ['year', 'year']
  ] as const)(
    'adds completedAt date filter for %s activity period',
    async (activityPeriod, expectedShift) => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-05-01T00:00:00.000Z'));
      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findMany
        .mockResolvedValueOnce([
          { id: 'author-1', createdAt: new Date('2026-04-30') }
        ])
        .mockResolvedValueOnce([buildUserRecord({ id: 'author-1' })]);
      mockPrisma.exchange.groupBy.mockResolvedValue([]);

      try {
        await catalogService.searchCatalogSkills({
          activityPeriod,
          page: 1,
          pageSize: 1
        });

        const expectedDate = new Date('2026-05-01T00:00:00.000Z');
        if (expectedShift === 'month') {
          expectedDate.setMonth(expectedDate.getMonth() - 1);
        } else if (expectedShift === 'year') {
          expectedDate.setFullYear(expectedDate.getFullYear() - 1);
        } else {
          expectedDate.setDate(expectedDate.getDate() - expectedShift);
        }

        expect(mockPrisma.exchange.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              completedAt: { gte: expectedDate }
            })
          })
        );
      } finally {
        jest.useRealTimers();
      }
    }
  );

  it('does not add completedAt date filter for allTime activity period', async () => {
    mockPrisma.user.count.mockResolvedValue(1);
    mockPrisma.user.findMany
      .mockResolvedValueOnce([
        { id: 'author-1', createdAt: new Date('2026-04-30') }
      ])
      .mockResolvedValueOnce([buildUserRecord({ id: 'author-1' })]);
    mockPrisma.exchange.groupBy.mockResolvedValue([]);

    await catalogService.searchCatalogSkills({
      activityPeriod: 'allTime',
      page: 1,
      pageSize: 1
    });

    expect(mockPrisma.exchange.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          completedAt: expect.anything()
        })
      })
    );
  });
});
