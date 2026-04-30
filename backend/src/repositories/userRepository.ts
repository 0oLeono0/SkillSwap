import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { hashToken } from '../utils/tokenHash.js';
import { normalizeEmail } from '../utils/normalizeEmail.js';

const includeSkills = {
  userSkills: true
};

type DbClient = PrismaClient | Prisma.TransactionClient;
export type AdminUsersSortBy = 'createdAt' | 'name' | 'email' | 'role';
export type AdminUsersSortDirection = 'asc' | 'desc';
type AdminUsersListQuery = {
  skip: number;
  take: number;
  sortBy: AdminUsersSortBy;
  sortDirection: AdminUsersSortDirection;
  search?: string;
};
type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

const getClient = (client?: DbClient) => client ?? prisma;
const normalizeSearch = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
const buildAdminUsersWhere = (
  search?: string
): Prisma.UserWhereInput | undefined => {
  const normalized = normalizeSearch(search);
  if (!normalized) {
    return undefined;
  }
  return {
    OR: [
      { name: { contains: normalized } },
      { email: { contains: normalized } }
    ]
  };
};

const buildAdminUsersOrderBy = (
  sortBy: AdminUsersSortBy,
  sortDirection: AdminUsersSortDirection
): Prisma.UserOrderByWithRelationInput[] => {
  if (sortBy === 'createdAt') {
    return [{ createdAt: sortDirection }, { id: sortDirection }];
  }

  return [
    { [sortBy]: sortDirection } as Prisma.UserOrderByWithRelationInput,
    { id: 'asc' }
  ];
};

export const userRepository = {
  findByEmail(email: string, client?: DbClient) {
    return getClient(client).user.findUnique({
      where: { email: normalizeEmail(email) },
      include: includeSkills
    });
  },

  findAll(client?: DbClient) {
    return getClient(client).user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: includeSkills
    });
  },

  findAdminUsers(
    { skip, take, search, sortBy, sortDirection }: AdminUsersListQuery,
    client?: DbClient
  ): Promise<AdminUserRow[]> {
    const where = buildAdminUsersWhere(search);
    const query: Prisma.UserFindManyArgs = {
      orderBy: buildAdminUsersOrderBy(sortBy, sortDirection),
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true
      }
    };

    if (where) {
      query.where = where;
    }

    return getClient(client).user.findMany(query) as Promise<AdminUserRow[]>;
  },

  countAdminUsers(search?: string, client?: DbClient) {
    const where = buildAdminUsersWhere(search);
    if (!where) {
      return getClient(client).user.count();
    }
    return getClient(client).user.count({ where });
  },

  findById(id: string, client?: DbClient) {
    return getClient(client).user.findUnique({
      where: { id },
      include: includeSkills
    });
  },

  create(data: Prisma.UserCreateInput, client?: DbClient) {
    return getClient(client).user.create({ data, include: includeSkills });
  },

  updateById(id: string, data: Prisma.UserUpdateInput, client?: DbClient) {
    return getClient(client).user.update({
      where: { id },
      data,
      include: includeSkills
    });
  },

  deleteById(id: string, client?: DbClient) {
    return getClient(client).user.delete({
      where: { id }
    });
  },

  saveRefreshToken(
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    client?: DbClient
  ) {
    return getClient(client).refreshToken.create({
      data: {
        id,
        userId,
        token: tokenHash,
        expiresAt
      }
    });
  },

  findRefreshToken(id: string, client?: DbClient) {
    return getClient(client).refreshToken.findUnique({ where: { id } });
  },

  deleteRefreshTokenIfValid(
    id: string,
    tokenHash: string,
    rawToken: string,
    now: Date,
    client?: DbClient
  ) {
    return getClient(client).refreshToken.deleteMany({
      where: {
        id,
        expiresAt: { gt: now },
        token: {
          in: [tokenHash, rawToken]
        }
      }
    });
  },

  deleteRefreshTokenIfExpired(
    id: string,
    tokenHash: string,
    rawToken: string,
    now: Date,
    client?: DbClient
  ) {
    return getClient(client).refreshToken.deleteMany({
      where: {
        id,
        expiresAt: { lte: now },
        token: {
          in: [tokenHash, rawToken]
        }
      }
    });
  },

  deleteRefreshTokenById(id: string, client?: DbClient) {
    return getClient(client).refreshToken.deleteMany({ where: { id } });
  },

  deleteRefreshTokenByToken(token: string, client?: DbClient) {
    const tokenHash = hashToken(token);
    return getClient(client).refreshToken.deleteMany({
      where: {
        token: {
          in: [tokenHash, token]
        }
      }
    });
  }
};
