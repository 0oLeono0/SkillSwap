import type {
  UserRatingsResponse,
  UserRatingDto
} from '@skillswap/contracts/ratings';
import type {
  User as PrismaUser,
  UserSkill as PrismaUserSkill
} from '@prisma/client';
import {
  userRepository,
  type AdminUsersSortBy,
  type AdminUsersSortDirection
} from '../repositories/userRepository.js';
import { exchangeRepository } from '../repositories/exchangeRepository.js';
import { parseImageUrls, type UserSkill } from '../types/userSkill.js';
import { isUserRole, type UserRole, USER_ROLE } from '../types/userRole.js';
import {
  isUserStatus,
  type UserStatus,
  USER_STATUS
} from '../types/userStatus.js';
import { USER_SKILL_TYPE } from '../types/userSkillType.js';
import { createNotFound } from '../utils/httpErrors.js';
import { NOT_FOUND_MESSAGES } from '../utils/errorMessages.js';

type UserRecord = PrismaUser & { userSkills?: PrismaUserSkill[] | null };

const mapSkillRecord = (record: PrismaUserSkill): UserSkill => ({
  id: record.id,
  title: record.title?.trim() ?? '',
  categoryId: typeof record.categoryId === 'number' ? record.categoryId : null,
  subcategoryId:
    typeof record.subcategoryId === 'number' ? record.subcategoryId : null,
  description: record.description?.trim() ?? '',
  imageUrls: parseImageUrls(record.imageUrls)
});

export type SanitizedUser = Omit<
  PrismaUser,
  'passwordHash' | 'role' | 'status'
> & {
  role: UserRole;
  status: UserStatus;
  teachableSkills: UserSkill[];
  learningSkills: UserSkill[];
};

export type PublicUser = Omit<SanitizedUser, 'email'>;
export type AdminListUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export type AdminUsersListResult = {
  users: AdminListUser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy: AdminUsersSortBy;
  sortDirection: AdminUsersSortDirection;
};

type ListAdminUsersOptions = {
  page: number;
  pageSize: number;
  sortBy?: AdminUsersSortBy;
  sortDirection?: AdminUsersSortDirection;
  search?: string;
};

type RatingRaterRecord = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type UserRatingRecord = {
  id: string;
  exchangeId: string;
  score: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  rater: RatingRaterRecord;
};

const normalizePagination = (value: number, fallback: number, max?: number) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  const intValue = Math.trunc(value);
  if (intValue < 1) {
    return fallback;
  }
  if (typeof max === 'number' && intValue > max) {
    return max;
  }
  return intValue;
};

const normalizeSearch = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
const normalizeSortBy = (value?: AdminUsersSortBy): AdminUsersSortBy =>
  value ?? 'createdAt';
const normalizeSortDirection = (
  value?: AdminUsersSortDirection
): AdminUsersSortDirection => value ?? 'desc';

const toAdminListUser = (user: {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}): AdminListUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: isUserRole(user.role) ? user.role : USER_ROLE.user,
  status: isUserStatus(user.status) ? user.status : USER_STATUS.active
});

export const sanitizeUser = (user: UserRecord | null): SanitizedUser | null => {
  if (!user) {
    return null;
  }

  const {
    passwordHash: _passwordHash,
    status,
    avatarUrl,
    userSkills,
    ...rest
  } = user;
  const normalizeNullableString = (value?: string | null) =>
    value && value.trim().length > 0 ? value : null;
  const normalizedSkills = Array.isArray(userSkills) ? userSkills : [];
  const teachableSkills: UserSkill[] = [];
  const learningSkills: UserSkill[] = [];

  for (const skill of normalizedSkills) {
    if (skill.type === USER_SKILL_TYPE.learn) {
      learningSkills.push(mapSkillRecord(skill));
    } else {
      teachableSkills.push(mapSkillRecord(skill));
    }
  }

  return {
    ...rest,
    avatarUrl: normalizeNullableString(avatarUrl),
    role: isUserRole(user.role) ? user.role : USER_ROLE.user,
    status: isUserStatus(status) ? status : USER_STATUS.active,
    teachableSkills,
    learningSkills
  };
};

const toPublicUser = (user: SanitizedUser): PublicUser => {
  const { email: _email, ...rest } = user;
  return rest;
};

const toUserRatingDto = (rating: UserRatingRecord): UserRatingDto => ({
  id: rating.id,
  exchangeId: rating.exchangeId,
  score: rating.score,
  comment: rating.comment,
  rater: {
    id: rating.rater.id,
    name: rating.rater.name,
    avatarUrl:
      rating.rater.avatarUrl && rating.rater.avatarUrl.trim().length > 0
        ? rating.rater.avatarUrl
        : null
  },
  createdAt: rating.createdAt.toISOString(),
  updatedAt: rating.updatedAt.toISOString()
});

export const userService = {
  async listUsers(): Promise<SanitizedUser[]> {
    const users = await userRepository.findAll();
    return users
      .map((user) => sanitizeUser(user))
      .filter((user): user is SanitizedUser => Boolean(user));
  },

  async listPublicUsers(): Promise<PublicUser[]> {
    const users = await userRepository.findAll();
    return users
      .map((user) => sanitizeUser(user))
      .filter((user): user is SanitizedUser => Boolean(user))
      .map(toPublicUser);
  },

  async listUsersForAdmin(
    options: ListAdminUsersOptions
  ): Promise<AdminUsersListResult> {
    const page = normalizePagination(options.page, 1);
    const pageSize = normalizePagination(options.pageSize, 25, 100);
    const search = normalizeSearch(options.search);
    const sortBy = normalizeSortBy(options.sortBy);
    const sortDirection = normalizeSortDirection(options.sortDirection);
    const skip = (page - 1) * pageSize;
    const listQueryBase = {
      skip,
      take: pageSize,
      sortBy,
      sortDirection
    };
    const listQuery = search ? { ...listQueryBase, search } : listQueryBase;

    const [usersRaw, total] = await Promise.all([
      userRepository.findAdminUsers(listQuery),
      userRepository.countAdminUsers(search)
    ]);

    const users = usersRaw.map(toAdminListUser);
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

    return {
      users,
      page,
      pageSize,
      total,
      totalPages,
      sortBy,
      sortDirection
    };
  },

  async getUserRatings(userId: string): Promise<UserRatingsResponse> {
    const user = await userRepository.findPublicById(userId);
    if (!user) {
      throw createNotFound(NOT_FOUND_MESSAGES.userNotFound);
    }

    const [ratingsRaw, aggregate] = await Promise.all([
      exchangeRepository.listRatingsForUser(userId),
      exchangeRepository.getAverageRatingForUser(userId)
    ]);

    const ratingsCount = aggregate._count.score;

    return {
      averageRating: aggregate._avg.score ?? null,
      ratingsCount,
      ratings: (ratingsRaw as UserRatingRecord[]).map(toUserRatingDto)
    };
  }
};
