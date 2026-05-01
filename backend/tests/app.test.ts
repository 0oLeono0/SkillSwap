import request from 'supertest';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockUserService: {
  listUsers: jest.MockedFunction<() => Promise<unknown>>;
  listPublicUsers: jest.MockedFunction<() => Promise<unknown>>;
  listUsersForAdmin: jest.MockedFunction<
    (options: {
      page: number;
      pageSize: number;
      search?: string;
      sortBy?: 'createdAt' | 'name' | 'email' | 'role';
      sortDirection?: 'asc' | 'desc';
    }) => Promise<unknown>
  >;
  getUserRatings: jest.MockedFunction<(userId: string) => Promise<unknown>>;
} = {
  listUsers: jest.fn(),
  listPublicUsers: jest.fn(),
  listUsersForAdmin: jest.fn(),
  getUserRatings: jest.fn()
};
const mockSanitizeUser: jest.Mock = jest.fn();
const mockCatalogService: {
  getFiltersBaseData: jest.MockedFunction<() => Promise<unknown>>;
  getSkillCategories: jest.MockedFunction<() => Promise<unknown>>;
  findSkillCategoryById: jest.MockedFunction<(id: number) => Promise<unknown>>;
  getCities: jest.MockedFunction<() => Promise<unknown>>;
  findCityById: jest.MockedFunction<(id: number) => Promise<unknown>>;
  searchCatalogSkills: jest.MockedFunction<
    (options: unknown) => Promise<unknown>
  >;
} = {
  getFiltersBaseData: jest.fn(),
  getSkillCategories: jest.fn(),
  findSkillCategoryById: jest.fn(),
  getCities: jest.fn(),
  findCityById: jest.fn(),
  searchCatalogSkills: jest.fn()
};

const mockTokenService = {
  verifyAccessToken: jest.fn(),
  createAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  createRefreshToken: jest.fn()
};

const mockRequestService: {
  listForUser: jest.MockedFunction<(userId: string) => Promise<unknown>>;
  createRequest: jest.MockedFunction<
    (
      userId: string,
      targetUserId: string,
      userSkillId: string
    ) => Promise<unknown>
  >;
  updateStatus: jest.MockedFunction<
    (requestId: string, userId: string, status: string) => Promise<unknown>
  >;
} = {
  listForUser: jest.fn(),
  createRequest: jest.fn(),
  updateStatus: jest.fn()
};

const mockExchangeService: {
  listForUser: jest.MockedFunction<(userId: string) => Promise<unknown>>;
  getDetails: jest.MockedFunction<
    (exchangeId: string, userId: string) => Promise<unknown>
  >;
  sendMessage: jest.MockedFunction<
    (exchangeId: string, userId: string, content: string) => Promise<unknown>
  >;
  completeExchange: jest.MockedFunction<
    (exchangeId: string, userId: string) => Promise<unknown>
  >;
  rateExchange: jest.MockedFunction<
    (exchangeId: string, raterId: string, payload: unknown) => Promise<unknown>
  >;
} = {
  listForUser: jest.fn(),
  getDetails: jest.fn(),
  sendMessage: jest.fn(),
  completeExchange: jest.fn(),
  rateExchange: jest.fn()
};

const mockMaterialService: {
  listForUserSkill: jest.MockedFunction<
    (userSkillId: string) => Promise<unknown>
  >;
  createMaterial: jest.MockedFunction<
    (actor: unknown, payload: unknown) => Promise<unknown>
  >;
  updateMaterial: jest.MockedFunction<
    (actor: unknown, materialId: string, payload: unknown) => Promise<unknown>
  >;
  deleteMaterial: jest.MockedFunction<
    (actor: unknown, materialId: string) => Promise<void>
  >;
  createQuestion: jest.MockedFunction<
    (actor: unknown, payload: unknown) => Promise<unknown>
  >;
  updateQuestion: jest.MockedFunction<
    (actor: unknown, questionId: string, payload: unknown) => Promise<unknown>
  >;
  deleteQuestion: jest.MockedFunction<
    (actor: unknown, questionId: string) => Promise<void>
  >;
  createAnswerOption: jest.MockedFunction<
    (actor: unknown, payload: unknown) => Promise<unknown>
  >;
  updateAnswerOption: jest.MockedFunction<
    (actor: unknown, optionId: string, payload: unknown) => Promise<unknown>
  >;
  deleteAnswerOption: jest.MockedFunction<
    (actor: unknown, optionId: string) => Promise<void>
  >;
} = {
  listForUserSkill: jest.fn(),
  createMaterial: jest.fn(),
  updateMaterial: jest.fn(),
  deleteMaterial: jest.fn(),
  createQuestion: jest.fn(),
  updateQuestion: jest.fn(),
  deleteQuestion: jest.fn(),
  createAnswerOption: jest.fn(),
  updateAnswerOption: jest.fn(),
  deleteAnswerOption: jest.fn()
};

jest.unstable_mockModule('../src/services/userService.js', () => ({
  userService: mockUserService,
  sanitizeUser: mockSanitizeUser
}));

jest.unstable_mockModule('../src/services/tokenService.js', () => ({
  tokenService: mockTokenService,
  refreshTtlMs: 0
}));

jest.unstable_mockModule('../src/services/catalogService.js', () => ({
  catalogService: mockCatalogService
}));

jest.unstable_mockModule('../src/services/requestService.js', () => ({
  requestService: mockRequestService
}));

jest.unstable_mockModule('../src/services/exchangeService.js', () => ({
  exchangeService: mockExchangeService
}));

jest.unstable_mockModule('../src/services/materialService.js', () => ({
  materialService: mockMaterialService
}));

const { HttpError } = await import('../src/utils/httpErrors.js');
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
          status: 'active',
          avatarUrl: null,
          cityId: null,
          teachableSkills: [],
          learningSkills: [],
          birthDate: null
        }
      ]);

      const response = await request(app).get('/api/users/public');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        users: [
          {
            id: 'user-1',
            name: 'User',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            cityId: null,
            teachableSkills: [],
            learningSkills: [],
            birthDate: null
          }
        ]
      });
    });
  });

  describe('GET /api/users/:userId/ratings', () => {
    it('returns public user ratings without auth', async () => {
      mockUserService.getUserRatings.mockResolvedValue({
        averageRating: 4.5,
        ratingsCount: 2,
        ratings: [
          {
            id: 'rating-1',
            exchangeId: 'exchange-1',
            score: 5,
            comment: 'Отличный обмен',
            rater: {
              id: 'rater-1',
              name: 'Автор оценки',
              avatarUrl: null
            },
            createdAt: '2026-04-30T00:00:00.000Z',
            updatedAt: '2026-04-30T00:00:00.000Z'
          }
        ]
      });

      const response = await request(app).get('/api/users/user-1/ratings');

      expect(response.status).toBe(200);
      expect(mockUserService.getUserRatings).toHaveBeenCalledWith('user-1');
      expect(response.body).toEqual({
        averageRating: 4.5,
        ratingsCount: 2,
        ratings: [
          {
            id: 'rating-1',
            exchangeId: 'exchange-1',
            score: 5,
            comment: 'Отличный обмен',
            rater: {
              id: 'rater-1',
              name: 'Автор оценки',
              avatarUrl: null
            },
            createdAt: '2026-04-30T00:00:00.000Z',
            updatedAt: '2026-04-30T00:00:00.000Z'
          }
        ]
      });
    });

    it('returns 404 when rated user is missing', async () => {
      mockUserService.getUserRatings.mockRejectedValue(
        new HttpError(404, 'Пользователь не найден')
      );

      const response = await request(app).get('/api/users/missing/ratings');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Пользователь не найден');
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
        role: 'owner'
      });
      mockUserService.listUsers.mockResolvedValue([
        {
          id: 'user-2',
          email: 'hidden@example.com',
          name: 'Hidden',
          role: 'user',
          status: 'active',
          avatarUrl: null,
          cityId: null,
          birthDate: null,
          gender: null,
          bio: null,
          teachableSkills: [],
          learningSkills: [],
          createdAt: new Date(0),
          updatedAt: new Date(0)
        }
      ]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer valid-token');

      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith(
        'valid-token'
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        users: [
          {
            id: 'user-2',
            email: 'hidden@example.com',
            name: 'Hidden',
            role: 'user',
            status: 'active',
            avatarUrl: null,
            cityId: null,
            birthDate: null,
            gender: null,
            bio: null,
            teachableSkills: [],
            learningSkills: [],
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ]
      });
    });
  });
});

describe('Catalog routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns filter base data from catalog service', async () => {
    mockCatalogService.getFiltersBaseData.mockResolvedValue({
      cities: [{ id: 1, name: 'City' }],
      skillGroups: [
        { id: 10, name: 'Group', skills: [{ id: 11, name: 'Skill' }] }
      ]
    });

    const response = await request(app).get('/api/catalog/filters');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      cities: [{ id: 1, name: 'City' }],
      skillGroups: [
        { id: 10, name: 'Group', skills: [{ id: 11, name: 'Skill' }] }
      ]
    });
  });

  it('returns catalog search results', async () => {
    mockCatalogService.searchCatalogSkills.mockResolvedValue({
      authors: [],
      page: 1,
      pageSize: 12,
      totalAuthors: 0
    });

    const response = await request(app).get('/api/catalog/search?mode=all');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authors: [],
      page: 1,
      pageSize: 12,
      totalAuthors: 0
    });
  });

  it('passes valid user status to catalog search', async () => {
    mockCatalogService.searchCatalogSkills.mockResolvedValue({
      authors: [],
      page: 1,
      pageSize: 12,
      totalAuthors: 0
    });

    const response = await request(app).get(
      '/api/catalog/search?status=active'
    );

    expect(response.status).toBe(200);
    expect(mockCatalogService.searchCatalogSkills).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'active'
      })
    );
  });

  it('ignores unknown catalog user status', async () => {
    mockCatalogService.searchCatalogSkills.mockResolvedValue({
      authors: [],
      page: 1,
      pageSize: 12,
      totalAuthors: 0
    });

    const response = await request(app).get(
      '/api/catalog/search?status=archived'
    );

    expect(response.status).toBe(200);
    expect(mockCatalogService.searchCatalogSkills).toHaveBeenCalledWith(
      expect.not.objectContaining({
        status: expect.anything()
      })
    );
  });

  it('returns skill categories list', async () => {
    mockCatalogService.getSkillCategories.mockResolvedValue([
      { id: 1, name: 'Cat', subskills: [] }
    ]);

    const response = await request(app).get('/api/skills');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, name: 'Cat', subskills: [] }]);
  });

  it('returns skill category by id', async () => {
    mockCatalogService.findSkillCategoryById.mockResolvedValue({
      id: 2,
      name: 'Cat2',
      subskills: []
    });

    const response = await request(app).get('/api/skills/2');
    expect(mockCatalogService.findSkillCategoryById).toHaveBeenCalledWith(2);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 2, name: 'Cat2', subskills: [] });
  });

  it('returns 404 when skill category not found', async () => {
    mockCatalogService.findSkillCategoryById.mockResolvedValue(null);

    const response = await request(app).get('/api/skills/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Skill category not found');
  });

  it('returns cities list', async () => {
    mockCatalogService.getCities.mockResolvedValue([{ id: 1, name: 'City' }]);

    const response = await request(app).get('/api/cities');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, name: 'City' }]);
  });

  it('returns city by id', async () => {
    mockCatalogService.findCityById.mockResolvedValue({ id: 3, name: 'City3' });

    const response = await request(app).get('/api/cities/3');
    expect(mockCatalogService.findCityById).toHaveBeenCalledWith(3);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 3, name: 'City3' });
  });

  it('returns 404 when city not found', async () => {
    mockCatalogService.findCityById.mockResolvedValue(null);

    const response = await request(app).get('/api/cities/404');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('City not found');
  });
});

describe('Admin routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthorized requests to owner users list', async () => {
    const response = await request(app).get('/api/admin/users');
    expect(response.status).toBe(401);
  });

  it('returns paginated lightweight users list for owner', async () => {
    mockTokenService.verifyAccessToken.mockReturnValue({
      sub: 'owner-1',
      email: 'owner@example.com',
      name: 'Owner',
      role: 'owner'
    });
    mockUserService.listUsersForAdmin.mockResolvedValue({
      users: [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          role: 'admin',
          status: 'active'
        }
      ],
      page: 2,
      pageSize: 10,
      total: 31,
      totalPages: 4,
      sortBy: 'email',
      sortDirection: 'asc'
    });

    const response = await request(app)
      .get(
        '/api/admin/users?page=2&pageSize=10&search=ali&sortBy=email&sortDirection=asc'
      )
      .set('Authorization', 'Bearer owner-token');

    expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith(
      'owner-token'
    );
    expect(mockUserService.listUsersForAdmin).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      search: 'ali',
      sortBy: 'email',
      sortDirection: 'asc'
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      users: [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          role: 'admin',
          status: 'active'
        }
      ],
      page: 2,
      pageSize: 10,
      total: 31,
      totalPages: 4,
      sortBy: 'email',
      sortDirection: 'asc'
    });
  });

  it('returns bad request on invalid pagination params', async () => {
    mockTokenService.verifyAccessToken.mockReturnValue({
      sub: 'owner-1',
      email: 'owner@example.com',
      name: 'Owner',
      role: 'owner'
    });

    const response = await request(app)
      .get('/api/admin/users?page=0&pageSize=500')
      .set('Authorization', 'Bearer owner-token');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid query params');
    expect(mockUserService.listUsersForAdmin).not.toHaveBeenCalled();
  });
});

describe('Requests routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@example.com',
      name: 'User',
      role: 'user'
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
      .send({ toUserId: 'target', userSkillId: 'skill-1' });

    expect(mockRequestService.createRequest).toHaveBeenCalledWith(
      'user-1',
      'target',
      'skill-1'
    );
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ request: { id: 'req-1' } });
  });

  it('returns list for authorized user', async () => {
    mockRequestService.listForUser.mockResolvedValue({
      incoming: [],
      outgoing: []
    });

    const response = await request(app)
      .get('/api/requests')
      .set('Authorization', 'Bearer token');

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
    mockRequestService.updateStatus.mockResolvedValue({
      id: 'req-1',
      status: 'accepted'
    });

    const response = await request(app)
      .patch('/api/requests/req-1')
      .set('Authorization', 'Bearer token')
      .send({ status: 'accepted' });

    expect(mockRequestService.updateStatus).toHaveBeenCalledWith(
      'req-1',
      'user-1',
      'accepted'
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      request: { id: 'req-1', status: 'accepted' }
    });
  });
});

describe('Exchange routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@example.com',
      name: 'User',
      role: 'user'
    });
  });

  it('rejects unauthenticated rating create', async () => {
    const response = await request(app)
      .post('/api/exchanges/ex-1/rating')
      .send({ score: 5 });

    expect(response.status).toBe(401);
    expect(mockExchangeService.rateExchange).not.toHaveBeenCalled();
  });

  it('creates exchange rating for authenticated user', async () => {
    mockExchangeService.rateExchange.mockResolvedValue({
      id: 'rating-1',
      exchangeId: 'ex-1',
      raterId: 'user-1',
      ratedUserId: 'user-2',
      score: 5,
      comment: 'Спасибо',
      createdAt: new Date(0),
      updatedAt: new Date(0)
    });

    const response = await request(app)
      .post('/api/exchanges/ex-1/rating')
      .set('Authorization', 'Bearer token')
      .send({ score: 5, comment: 'Спасибо' });

    expect(response.status).toBe(201);
    expect(mockExchangeService.rateExchange).toHaveBeenCalledWith(
      'ex-1',
      'user-1',
      { score: 5, comment: 'Спасибо' }
    );
    expect(response.body).toEqual({
      rating: {
        id: 'rating-1',
        exchangeId: 'ex-1',
        raterId: 'user-1',
        ratedUserId: 'user-2',
        score: 5,
        comment: 'Спасибо',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('rejects invalid rating payload before service call', async () => {
    const response = await request(app)
      .post('/api/exchanges/ex-1/rating')
      .set('Authorization', 'Bearer token')
      .send({ score: 6, ratedUserId: 'user-2' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid rating payload');
    expect(mockExchangeService.rateExchange).not.toHaveBeenCalled();
  });
});

describe('Material routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@example.com',
      name: 'User',
      role: 'user'
    });
  });

  it('returns user skill materials without auth', async () => {
    mockMaterialService.listForUserSkill.mockResolvedValue([
      {
        id: 'material-1',
        userSkillId: 'skill-1',
        type: 'testing',
        title: 'Test',
        questions: []
      }
    ]);

    const response = await request(app).get(
      '/api/user-skills/skill-1/materials'
    );

    expect(response.status).toBe(200);
    expect(mockMaterialService.listForUserSkill).toHaveBeenCalledWith(
      'skill-1'
    );
    expect(response.body).toEqual({
      materials: [
        {
          id: 'material-1',
          userSkillId: 'skill-1',
          type: 'testing',
          title: 'Test',
          questions: []
        }
      ]
    });
  });

  it('rejects unauthenticated material create', async () => {
    const response = await request(app)
      .post('/api/user-skills/skill-1/materials')
      .send({ type: 'theory', title: 'Theory' });

    expect(response.status).toBe(401);
    expect(mockMaterialService.createMaterial).not.toHaveBeenCalled();
  });

  it('creates material with route userSkillId injected into contract payload', async () => {
    mockMaterialService.createMaterial.mockResolvedValue({
      id: 'material-1',
      userSkillId: 'skill-1',
      type: 'theory',
      title: 'Theory'
    });

    const response = await request(app)
      .post('/api/user-skills/skill-1/materials')
      .set('Authorization', 'Bearer token')
      .send({ type: 'theory', title: 'Theory' });

    expect(response.status).toBe(201);
    expect(mockMaterialService.createMaterial).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      { userSkillId: 'skill-1', type: 'theory', title: 'Theory' }
    );
  });

  it('rejects mismatched body userSkillId', async () => {
    const response = await request(app)
      .post('/api/user-skills/skill-1/materials')
      .set('Authorization', 'Bearer token')
      .send({ userSkillId: 'other-skill', type: 'theory', title: 'Theory' });

    expect(response.status).toBe(400);
    expect(mockMaterialService.createMaterial).not.toHaveBeenCalled();
  });

  it('updates and deletes material for authenticated user', async () => {
    mockMaterialService.updateMaterial.mockResolvedValue({
      id: 'material-1',
      title: 'Updated'
    });

    const updateResponse = await request(app)
      .patch('/api/materials/material-1')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Updated' });

    expect(updateResponse.status).toBe(200);
    expect(mockMaterialService.updateMaterial).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      'material-1',
      { title: 'Updated' }
    );

    const deleteResponse = await request(app)
      .delete('/api/materials/material-1')
      .set('Authorization', 'Bearer token');

    expect(deleteResponse.status).toBe(204);
    expect(mockMaterialService.deleteMaterial).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      'material-1'
    );
  });

  it('creates question and answer option with route ids injected', async () => {
    mockMaterialService.createQuestion.mockResolvedValue({ id: 'question-1' });
    mockMaterialService.createAnswerOption.mockResolvedValue({
      id: 'option-1'
    });

    const questionResponse = await request(app)
      .post('/api/materials/material-1/questions')
      .set('Authorization', 'Bearer token')
      .send({ text: 'Question' });

    expect(questionResponse.status).toBe(201);
    expect(mockMaterialService.createQuestion).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      { materialId: 'material-1', text: 'Question' }
    );

    const optionResponse = await request(app)
      .post('/api/material-questions/question-1/options')
      .set('Authorization', 'Bearer token')
      .send({ text: 'Answer', isCorrect: true });

    expect(optionResponse.status).toBe(201);
    expect(mockMaterialService.createAnswerOption).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      { questionId: 'question-1', text: 'Answer', isCorrect: true }
    );
  });

  it('updates and deletes question and answer option', async () => {
    mockMaterialService.updateQuestion.mockResolvedValue({ id: 'question-1' });
    mockMaterialService.updateAnswerOption.mockResolvedValue({
      id: 'option-1'
    });

    const questionResponse = await request(app)
      .patch('/api/material-questions/question-1')
      .set('Authorization', 'Bearer token')
      .send({ text: 'Updated question' });

    expect(questionResponse.status).toBe(200);
    expect(mockMaterialService.updateQuestion).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      'question-1',
      { text: 'Updated question' }
    );

    const optionResponse = await request(app)
      .patch('/api/material-answer-options/option-1')
      .set('Authorization', 'Bearer token')
      .send({ isCorrect: false });

    expect(optionResponse.status).toBe(200);
    expect(mockMaterialService.updateAnswerOption).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      'option-1',
      { isCorrect: false }
    );

    const deleteQuestionResponse = await request(app)
      .delete('/api/material-questions/question-1')
      .set('Authorization', 'Bearer token');
    const deleteOptionResponse = await request(app)
      .delete('/api/material-answer-options/option-1')
      .set('Authorization', 'Bearer token');

    expect(deleteQuestionResponse.status).toBe(204);
    expect(deleteOptionResponse.status).toBe(204);
    expect(mockMaterialService.deleteQuestion).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      'question-1'
    );
    expect(mockMaterialService.deleteAnswerOption).toHaveBeenCalledWith(
      { userId: 'user-1', role: 'user' },
      'option-1'
    );
  });

  it('rejects unknown fields using contract schemas', async () => {
    const response = await request(app)
      .post('/api/materials/material-1/questions')
      .set('Authorization', 'Bearer token')
      .send({ text: 'Question', score: 5 });

    expect(response.status).toBe(400);
    expect(mockMaterialService.createQuestion).not.toHaveBeenCalled();
  });
});
