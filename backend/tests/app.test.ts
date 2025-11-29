import request from 'supertest';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockUserService: {
  listUsers: jest.MockedFunction<() => Promise<unknown>>;
  listPublicUsers: jest.MockedFunction<() => Promise<unknown>>;
} = {
  listUsers: jest.fn(),
  listPublicUsers: jest.fn(),
};
const mockSanitizeUser: jest.Mock = jest.fn();
const mockCatalogService: { getFiltersBaseData: jest.MockedFunction<() => unknown> } = {
  getFiltersBaseData: jest.fn(),
};

const mockTokenService = {
  verifyAccessToken: jest.fn(),
  createAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  createRefreshToken: jest.fn(),
};

const mockRequestService: {
  listForUser: jest.MockedFunction<(userId: string) => Promise<unknown>>;
  createRequest: jest.MockedFunction<(userId: string, targetUserId: string, skillId: string) => Promise<unknown>>;
  updateStatus: jest.MockedFunction<(requestId: string, userId: string, status: string) => Promise<unknown>>;
} = {
  listForUser: jest.fn(),
  createRequest: jest.fn(),
  updateStatus: jest.fn(),
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

jest.unstable_mockModule('../src/services/requestService.js', () => ({
  requestService: mockRequestService,
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

describe('Requests routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@example.com',
      name: 'User',
      role: 'user',
    });
  });

  it('rejects invalid payload on create', async () => {
    const response = await request(app)
      .post('/api/requests')
      .set('Authorization', 'Bearer token')
      .send({ toUserId: '' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid payload');
    expect(mockRequestService.createRequest).not.toHaveBeenCalled();
  });

  it('passes validated payload to requestService', async () => {
    mockRequestService.createRequest.mockResolvedValue({ id: 'req-1' });

    const response = await request(app)
      .post('/api/requests')
      .set('Authorization', 'Bearer token')
      .send({ toUserId: 'target', skillId: 'skill-1' });

    expect(mockRequestService.createRequest).toHaveBeenCalledWith('user-1', 'target', 'skill-1');
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ request: { id: 'req-1' } });
  });

  it('returns list for authorized user', async () => {
    mockRequestService.listForUser.mockResolvedValue({ incoming: [], outgoing: [] });

    const response = await request(app).get('/api/requests').set('Authorization', 'Bearer token');

    expect(mockRequestService.listForUser).toHaveBeenCalledWith('user-1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ incoming: [], outgoing: [] });
  });

  it('rejects invalid status payload on update', async () => {
    const response = await request(app)
      .patch('/api/requests/req-1')
      .set('Authorization', 'Bearer token')
      .send({ status: 'unknown' });

    expect(response.status).toBe(400);
    expect(mockRequestService.updateStatus).not.toHaveBeenCalled();
  });

  it('updates status for participant', async () => {
    mockRequestService.updateStatus.mockResolvedValue({ id: 'req-1', status: 'accepted' });

    const response = await request(app)
      .patch('/api/requests/req-1')
      .set('Authorization', 'Bearer token')
      .send({ status: 'accepted' });

    expect(mockRequestService.updateStatus).toHaveBeenCalledWith('req-1', 'user-1', 'accepted');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ request: { id: 'req-1', status: 'accepted' } });
  });
});
