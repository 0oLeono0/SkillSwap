import request from 'supertest';
import { jest } from '@jest/globals';

const mockUserService = {
  listUsers: jest.fn(),
  listPublicUsers: jest.fn(),
};
const mockSanitizeUser = jest.fn();
const mockCatalogService = {
  getFiltersBaseData: jest.fn(),
};

const mockTokenService = {
  verifyAccessToken: jest.fn(),
  createAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  createRefreshToken: jest.fn(),
};

jest.unstable_mockModule('../src/services/userService.js', () => ({
  userService: mockUserService,
  sanitizeUser: mockSanitizeUser,
}));

jest.unstable_mockModule('../src/services/tokenService.js', () => ({
  tokenService: mockTokenService,
  refreshTtlMs: 0,
}));

jest.unstable_mockModule('../src/services/catalogService.js', () => ({
  catalogService: mockCatalogService,
}));

const { app } = await import('../src/app.js');

describe('GET /api/health', () => {
  it('responds with ok status payload', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('Users routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/public', () => {
    it('returns sanitized list from user service', async () => {
      mockUserService.listPublicUsers.mockResolvedValue([
        {
          id: 'user-1',
          name: 'User',
          role: 'user',
          avatarUrl: null,
          cityId: null,
          teachableSkills: [],
          learningSkills: [],
          birthDate: null,
        },
      ]);

      const response = await request(app).get('/api/users/public');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        users: [
          {
            id: 'user-1',
            name: 'User',
            role: 'user',
            avatarUrl: null,
            cityId: null,
            teachableSkills: [],
            learningSkills: [],
            birthDate: null,
          },
        ],
      });
    });
  });

  describe('GET /api/users', () => {
    it('rejects unauthorized requests', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(401);
    });

    it('allows owner/admin and returns list', async () => {
      mockTokenService.verifyAccessToken.mockReturnValue({
        sub: 'admin',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'owner',
      });
      mockUserService.listUsers.mockResolvedValue([
        {
          id: 'user-2',
          email: 'hidden@example.com',
          name: 'Hidden',
          role: 'user',
          avatarUrl: null,
          cityId: null,
          birthDate: null,
          gender: null,
          bio: null,
          teachableSkills: [],
          learningSkills: [],
          createdAt: new Date(0),
          updatedAt: new Date(0),
        },
      ]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token');

      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        users: [
          {
            id: 'user-2',
            email: 'hidden@example.com',
            name: 'Hidden',
            role: 'user',
            avatarUrl: null,
            cityId: null,
            birthDate: null,
            gender: null,
            bio: null,
            teachableSkills: [],
            learningSkills: [],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ],
      });
    });
  });
});

describe('Catalog routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns filter base data from catalog service', async () => {
    mockCatalogService.getFiltersBaseData.mockReturnValue({
      cities: [{ id: 1, name: 'City' }],
      skillGroups: [{ id: 10, name: 'Group', skills: [{ id: 11, name: 'Skill' }] }],
    });

    const response = await request(app).get('/api/catalog/filters');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      cities: [{ id: 1, name: 'City' }],
      skillGroups: [{ id: 10, name: 'Group', skills: [{ id: 11, name: 'Skill' }] }],
    });
  });
});
