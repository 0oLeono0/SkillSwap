import { describe, expect, it } from '@jest/globals';
import type {
  User as PrismaUser,
  UserSkill as PrismaUserSkill
} from '@prisma/client';
import { sanitizeUser } from '../src/services/userService.js';

describe('userService.sanitizeUser', () => {
  const baseUser: PrismaUser & { userSkills: PrismaUserSkill[] } = {
    id: 'user-1',
    email: 'user@example.com',
    passwordHash: 'hashed',
    name: 'User',
    role: 'user',
    avatarUrl: '',
    cityId: null,
    birthDate: null,
    gender: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userSkills: []
  };

  it('returns null when user is null', () => {
    expect(sanitizeUser(null)).toBeNull();
  });

  it('normalizes empty avatar to null', () => {
    const result = sanitizeUser(baseUser);
    expect(result?.avatarUrl).toBeNull();
  });

  it('keeps non-empty avatar', () => {
    const result = sanitizeUser({
      ...baseUser,
      avatarUrl: 'https://example.com/a.png'
    });
    expect(result?.avatarUrl).toBe('https://example.com/a.png');
  });
});
