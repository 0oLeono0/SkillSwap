import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AdminUsersQuery = {
  skip: number;
  take: number;
  sortBy: 'createdAt' | 'name' | 'email' | 'role';
  sortDirection: 'asc' | 'desc';
  search?: string;
};

const mockUserRepository: {
  findAdminUsers: jest.MockedFunction<
    (query: AdminUsersQuery) => Promise<AdminUserRow[]>
  >;
  countAdminUsers: jest.MockedFunction<(search?: string) => Promise<number>>;
} = {
  findAdminUsers: jest.fn(),
  countAdminUsers: jest.fn()
};

jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
  userRepository: mockUserRepository
}));

const { userService } = await import('../src/services/userService.js');

describe('userService.listUsersForAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns lightweight paginated users and normalizes role', async () => {
    mockUserRepository.findAdminUsers.mockResolvedValue([
      { id: 'u1', email: 'alice@example.com', name: 'Alice', role: 'admin' },
      {
        id: 'u2',
        email: 'bob@example.com',
        name: 'Bob',
        role: 'unexpected-role'
      }
    ]);
    mockUserRepository.countAdminUsers.mockResolvedValue(12);

    const result = await userService.listUsersForAdmin({
      page: 2,
      pageSize: 5,
      search: '  ali  ',
      sortBy: 'name',
      sortDirection: 'asc'
    });

    expect(mockUserRepository.findAdminUsers).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      sortBy: 'name',
      sortDirection: 'asc',
      search: 'ali'
    });
    expect(mockUserRepository.countAdminUsers).toHaveBeenCalledWith('ali');

    expect(result).toEqual({
      users: [
        { id: 'u1', email: 'alice@example.com', name: 'Alice', role: 'admin' },
        { id: 'u2', email: 'bob@example.com', name: 'Bob', role: 'user' }
      ],
      page: 2,
      pageSize: 5,
      total: 12,
      totalPages: 3,
      sortBy: 'name',
      sortDirection: 'asc'
    });
  });

  it('normalizes invalid pagination values and empty totals', async () => {
    mockUserRepository.findAdminUsers.mockResolvedValue([]);
    mockUserRepository.countAdminUsers.mockResolvedValue(0);

    const result = await userService.listUsersForAdmin({
      page: 0,
      pageSize: 1000,
      search: '   '
    });

    expect(mockUserRepository.findAdminUsers).toHaveBeenCalledWith({
      skip: 0,
      take: 100,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });
    expect(mockUserRepository.countAdminUsers).toHaveBeenCalledWith(undefined);
    expect(result).toEqual({
      users: [],
      page: 1,
      pageSize: 100,
      total: 0,
      totalPages: 0,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });
  });
});
