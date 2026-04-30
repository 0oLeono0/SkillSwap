import { beforeEach, describe, expect, it, jest } from '@jest/globals';
const mockExchangeRepository: {
  findByRequestId: jest.MockedFunction<(requestId: string) => Promise<unknown>>;
  createFromRequest: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  listForUser: jest.MockedFunction<(userId: string) => Promise<unknown>>;
  findDetailedById: jest.MockedFunction<
    (exchangeId: string) => Promise<unknown>
  >;
  findSummaryById: jest.MockedFunction<
    (exchangeId: string) => Promise<unknown>
  >;
  markCompleted: jest.MockedFunction<(exchangeId: string) => Promise<unknown>>;
  createMessage: jest.MockedFunction<
    (exchangeId: string, senderId: string, content: string) => Promise<unknown>
  >;
  findRatingByExchangeAndRater: jest.MockedFunction<
    (exchangeId: string, raterId: string) => Promise<unknown>
  >;
  createRating: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  listRatingsForUser: jest.MockedFunction<
    (ratedUserId: string) => Promise<unknown>
  >;
  getAverageRatingForUser: jest.MockedFunction<
    (ratedUserId: string) => Promise<unknown>
  >;
} = {
  findByRequestId: jest.fn(),
  createFromRequest: jest.fn(),
  listForUser: jest.fn(),
  findDetailedById: jest.fn(),
  findSummaryById: jest.fn(),
  markCompleted: jest.fn(),
  createMessage: jest.fn(),
  findRatingByExchangeAndRater: jest.fn(),
  createRating: jest.fn(),
  listRatingsForUser: jest.fn(),
  getAverageRatingForUser: jest.fn()
};

jest.unstable_mockModule('../src/repositories/exchangeRepository.js', () => ({
  exchangeRepository: mockExchangeRepository
}));

const { exchangeService } = await import('../src/services/exchangeService.js');

describe('exchangeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const buildRequest = (overrides = {}) => ({
    id: 'req-1',
    userSkillId: 'skill-1',
    skillTitle: 'Skill',
    skillType: 'teach',
    skillSubcategoryId: 10,
    skillCategoryId: 1,
    createdAt: new Date(0),
    ...overrides
  });

  const buildParticipant = (overrides = {}) => ({
    id: 'user',
    name: 'User',
    avatarUrl: null,
    ...overrides
  });

  const buildExchange = (overrides = {}) => ({
    id: 'ex-1',
    status: 'active',
    confirmedAt: new Date(0),
    completedAt: null,
    initiatorId: 'user',
    recipientId: 'other',
    request: buildRequest(),
    initiator: buildParticipant({ id: 'user' }),
    recipient: buildParticipant({ id: 'other' }),
    ...overrides
  });

  const buildRating = (overrides = {}) => ({
    id: 'rating-1',
    exchangeId: 'ex',
    raterId: 'user',
    ratedUserId: 'other',
    score: 5,
    comment: 'Спасибо за обмен',
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides
  });

  describe('ensureCreatedFromRequest', () => {
    it('returns existing exchange when found', async () => {
      const existing = { id: 'ex-1' };
      mockExchangeRepository.findByRequestId.mockResolvedValue(existing);

      const result = await exchangeService.ensureCreatedFromRequest({
        id: 'request-1',
        fromUserId: 'u1',
        toUserId: 'u2'
      });

      expect(result).toBe(existing);
      expect(mockExchangeRepository.createFromRequest).not.toHaveBeenCalled();
    });

    it('creates exchange when none exists', async () => {
      mockExchangeRepository.findByRequestId.mockResolvedValue(null);
      mockExchangeRepository.createFromRequest.mockResolvedValue({
        id: 'new-exchange'
      });

      const result = await exchangeService.ensureCreatedFromRequest({
        id: 'request-1',
        fromUserId: 'u1',
        toUserId: 'u2'
      });

      expect(mockExchangeRepository.createFromRequest).toHaveBeenCalledWith({
        requestId: 'request-1',
        initiatorId: 'u1',
        recipientId: 'u2'
      });
      expect(result).toEqual({ id: 'new-exchange' });
    });
  });

  describe('getDetails', () => {
    it('throws 404 when exchange missing', async () => {
      mockExchangeRepository.findDetailedById.mockResolvedValue(null);

      await expect(
        exchangeService.getDetails('ex-1', 'user')
      ).rejects.toMatchObject({ status: 404 });
    });

    it('throws 403 when user is not participant', async () => {
      mockExchangeRepository.findDetailedById.mockResolvedValue({
        id: 'ex-1',
        initiatorId: 'a',
        recipientId: 'b'
      });

      await expect(
        exchangeService.getDetails('ex-1', 'outsider')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('returns exchange for participant', async () => {
      const exchange = buildExchange();
      mockExchangeRepository.findDetailedById.mockResolvedValue(exchange);

      const result = await exchangeService.getDetails('ex-1', 'user');
      expect(result).toMatchObject({
        id: 'ex-1',
        status: 'active',
        request: {
          id: 'req-1',
          userSkillId: 'skill-1',
          skill: { id: 'skill-1', title: 'Skill', type: 'teach' }
        }
      });
    });
  });

  describe('sendMessage', () => {
    it('throws 404 when exchange missing', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(null);
      await expect(
        exchangeService.sendMessage('ex', 'user', 'hi')
      ).rejects.toMatchObject({ status: 404 });
    });

    it('throws 403 if user not participant', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue({
        id: 'ex',
        initiatorId: 'a',
        recipientId: 'b',
        status: 'active'
      });

      await expect(
        exchangeService.sendMessage('ex', 'outsider', 'hi')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('throws 400 when exchange already completed', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue({
        id: 'ex',
        initiatorId: 'user',
        recipientId: 'other',
        status: 'completed'
      });

      await expect(
        exchangeService.sendMessage('ex', 'user', 'hi')
      ).rejects.toMatchObject({ status: 400 });
    });

    it('throws 400 when message is blank', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue({
        id: 'ex',
        initiatorId: 'user',
        recipientId: 'other',
        status: 'active'
      });

      await expect(
        exchangeService.sendMessage('ex', 'user', '   ')
      ).rejects.toMatchObject({ status: 400 });
    });

    it('creates message with trimmed content', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue({
        id: 'ex',
        initiatorId: 'user',
        recipientId: 'other',
        status: 'active'
      });
      mockExchangeRepository.createMessage.mockResolvedValue({ id: 'msg' });

      const result = await exchangeService.sendMessage(
        'ex',
        'user',
        '  hello  '
      );

      expect(mockExchangeRepository.createMessage).toHaveBeenCalledWith(
        'ex',
        'user',
        'hello'
      );
      expect(result).toEqual({ id: 'msg' });
    });
  });

  describe('completeExchange', () => {
    it('throws 404 when exchange missing', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(null);
      await expect(
        exchangeService.completeExchange('ex', 'user')
      ).rejects.toMatchObject({ status: 404 });
    });

    it('throws 403 when user not participant', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue({
        id: 'ex',
        initiatorId: 'a',
        recipientId: 'b',
        status: 'active'
      });

      await expect(
        exchangeService.completeExchange('ex', 'outsider')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('returns exchange when already completed', async () => {
      const exchange = buildExchange({ id: 'ex', status: 'completed' });
      mockExchangeRepository.findSummaryById.mockResolvedValue(exchange);

      const result = await exchangeService.completeExchange('ex', 'user');
      expect(result).toMatchObject({
        id: 'ex',
        status: 'completed',
        request: {
          id: 'req-1',
          userSkillId: 'skill-1',
          skill: { id: 'skill-1', title: 'Skill', type: 'teach' }
        }
      });
      expect(mockExchangeRepository.markCompleted).not.toHaveBeenCalled();
    });

    it('marks exchange completed otherwise', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(
        buildExchange({ id: 'ex', status: 'active' })
      );
      mockExchangeRepository.markCompleted.mockResolvedValue(
        buildExchange({ id: 'ex', status: 'completed' })
      );

      const result = await exchangeService.completeExchange('ex', 'user');

      expect(mockExchangeRepository.markCompleted).toHaveBeenCalledWith('ex');
      expect(result).toMatchObject({
        id: 'ex',
        status: 'completed',
        request: {
          id: 'req-1',
          userSkillId: 'skill-1',
          skill: { id: 'skill-1', title: 'Skill', type: 'teach' }
        }
      });
    });
  });

  describe('rateExchange', () => {
    beforeEach(() => {
      mockExchangeRepository.findRatingByExchangeAndRater.mockResolvedValue(
        null
      );
      mockExchangeRepository.createRating.mockResolvedValue(buildRating());
    });

    it('creates rating for completed exchange participant', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(
        buildExchange({ id: 'ex', status: 'completed' })
      );

      const result = await exchangeService.rateExchange('ex', 'user', {
        score: 5,
        comment: '  Спасибо за обмен  '
      });

      expect(
        mockExchangeRepository.findRatingByExchangeAndRater
      ).toHaveBeenCalledWith('ex', 'user');
      expect(mockExchangeRepository.createRating).toHaveBeenCalledWith({
        exchangeId: 'ex',
        raterId: 'user',
        ratedUserId: 'other',
        score: 5,
        comment: 'Спасибо за обмен'
      });
      expect(result).toMatchObject({
        id: 'rating-1',
        exchangeId: 'ex',
        raterId: 'user',
        ratedUserId: 'other',
        score: 5
      });
    });

    it('rejects rating when exchange is not completed', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(
        buildExchange({ id: 'ex', status: 'active' })
      );

      await expect(
        exchangeService.rateExchange('ex', 'user', { score: 5 })
      ).rejects.toMatchObject({ status: 400 });

      expect(mockExchangeRepository.createRating).not.toHaveBeenCalled();
    });

    it('rejects rating from non-participant', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(
        buildExchange({ id: 'ex', status: 'completed' })
      );

      await expect(
        exchangeService.rateExchange('ex', 'outsider', { score: 5 })
      ).rejects.toMatchObject({ status: 403 });

      expect(
        mockExchangeRepository.findRatingByExchangeAndRater
      ).not.toHaveBeenCalled();
      expect(mockExchangeRepository.createRating).not.toHaveBeenCalled();
    });

    it('rejects duplicate rating by same rater for exchange', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(
        buildExchange({ id: 'ex', status: 'completed' })
      );
      mockExchangeRepository.findRatingByExchangeAndRater.mockResolvedValue(
        buildRating()
      );

      await expect(
        exchangeService.rateExchange('ex', 'user', { score: 5 })
      ).rejects.toMatchObject({ status: 409 });

      expect(mockExchangeRepository.createRating).not.toHaveBeenCalled();
    });

    it('automatically rates the second participant', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(
        buildExchange({ id: 'ex', status: 'completed' })
      );
      mockExchangeRepository.createRating.mockResolvedValue(
        buildRating({
          raterId: 'other',
          ratedUserId: 'user',
          comment: null
        })
      );

      await exchangeService.rateExchange('ex', 'other', { score: 4 });

      expect(mockExchangeRepository.createRating).toHaveBeenCalledWith({
        exchangeId: 'ex',
        raterId: 'other',
        ratedUserId: 'user',
        score: 4
      });
    });

    it('rejects invalid score and comment', async () => {
      mockExchangeRepository.findSummaryById.mockResolvedValue(
        buildExchange({ id: 'ex', status: 'completed' })
      );

      await expect(
        exchangeService.rateExchange('ex', 'user', { score: 6 })
      ).rejects.toMatchObject({ status: 400 });

      await expect(
        exchangeService.rateExchange('ex', 'user', {
          score: 5,
          comment: 'x'.repeat(501)
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });
});
