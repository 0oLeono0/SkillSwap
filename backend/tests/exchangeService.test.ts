import { jest } from '@jest/globals';
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
} = {
  findByRequestId: jest.fn(),
  createFromRequest: jest.fn(),
  listForUser: jest.fn(),
  findDetailedById: jest.fn(),
  findSummaryById: jest.fn(),
  markCompleted: jest.fn(),
  createMessage: jest.fn()
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
});
