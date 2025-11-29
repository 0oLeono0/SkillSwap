import { sanitizeUser } from '../src/services/userService.js';

describe('userService.sanitizeUser', () => {
  const baseUser = {
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
    teachableSkills: '[]',
    learningSkills: '[]',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('returns null when user is null', () => {
    expect(sanitizeUser(null)).toBeNull();
  });

  it('normalizes empty avatar to null', () => {
    const result = sanitizeUser(baseUser as any);
    expect(result?.avatarUrl).toBeNull();
  });

  it('keeps non-empty avatar', () => {
    const result = sanitizeUser({ ...baseUser, avatarUrl: 'https://example.com/a.png' } as any);
    expect(result?.avatarUrl).toBe('https://example.com/a.png');
  });
});
