import { jest } from '@jest/globals';
import type { RequestStatus } from '../src/types/requestStatus.js';

type TransactionCallback = (tx: unknown) => unknown | Promise<unknown>;
type TransactionMock = jest.MockedFunction<
  (fn: TransactionCallback) => Promise<unknown>
>;

const mockPrisma: { $transaction: TransactionMock } = {
  $transaction: jest.fn()
};

const mockRequestRepository: {
  findForUser: jest.MockedFunction<(userId: string) => Promise<unknown>>;
  findPendingDuplicate: jest.MockedFunction<
    (
      fromUserId: string,
      toUserId: string,
      userSkillId: string
    ) => Promise<unknown>
  >;
  create: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  findById: jest.MockedFunction<(id: string) => Promise<unknown>>;
  updateStatus: jest.MockedFunction<
    (id: string, status: RequestStatus) => Promise<unknown>
  >;
} = {
  findForUser: jest.fn(),
  findPendingDuplicate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateStatus: jest.fn()
};

const mockUserRepository: {
  findById: jest.MockedFunction<(id: string) => Promise<unknown>>;
} = {
  findById: jest.fn()
};

const mockUserSkillRepository: {
  findById: jest.MockedFunction<(id: string) => Promise<unknown>>;
} = {
  findById: jest.fn()
};

const mockExchangeService: {
  ensureCreatedFromRequest: jest.MockedFunction<
    (request: unknown) => Promise<unknown>
  >;
} = {
  ensureCreatedFromRequest: jest.fn()
};

jest.unstable_mockModule('../src/repositories/requestRepository.js', () => ({
  requestRepository: mockRequestRepository
}));

jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
  userRepository: mockUserRepository
}));

jest.unstable_mockModule('../src/repositories/userSkillRepository.js', () => ({
  userSkillRepository: mockUserSkillRepository
}));

jest.unstable_mockModule('../src/services/exchangeService.js', () => ({
  exchangeService: mockExchangeService
}));

jest.unstable_mockModule('../src/lib/prisma.js', () => ({
  prisma: mockPrisma
}));

const { requestService } = await import('../src/services/requestService.js');

const buildRequestRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'req',
  userSkillId: 'skill',
  skillTitle: 'Skill',
  skillType: 'teach',
  skillSubcategoryId: 10,
  skillCategoryId: 1,
  status: 'pending',
  fromUserId: 'me',
  toUserId: 'other',
  createdAt: new Date(0),
  updatedAt: new Date(0),
  ...overrides
});

describe('requestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn: TransactionCallback) =>
      fn({})
    );
  });

  describe('listForUser', () => {
    it('splits requests into incoming and outgoing', async () => {
      mockRequestRepository.findForUser.mockResolvedValue([
        buildRequestRecord({ id: '1', toUserId: 'me', fromUserId: 'u1' }),
        buildRequestRecord({ id: '2', toUserId: 'u2', fromUserId: 'me' })
      ]);

      const result = await requestService.listForUser('me');

      expect(result.incoming).toHaveLength(1);
      expect(result.outgoing).toHaveLength(1);
      expect(result.incoming[0]).toMatchObject({
        id: '1',
        toUserId: 'me',
        fromUserId: 'u1',
        skill: { id: 'skill', title: 'Skill', type: 'teach' }
      });
      expect(result.outgoing[0]).toMatchObject({
        id: '2',
        toUserId: 'u2',
        fromUserId: 'me',
        skill: { id: 'skill', title: 'Skill', type: 'teach' }
      });
    });
  });

  describe('createRequest', () => {
    it('throws when users are equal', async () => {
      await expect(
        requestService.createRequest('me', 'me', 'skill')
      ).rejects.toMatchObject({ status: 400 });
    });

    it('throws when target user missing', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        requestService.createRequest('me', 'other', 'skill')
      ).rejects.toMatchObject({ status: 404 });
    });

    it('throws when skill missing', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'other' });
      mockUserSkillRepository.findById.mockResolvedValue(null);

      await expect(
        requestService.createRequest('me', 'other', 'skill')
      ).rejects.toMatchObject({ status: 400 });
    });

    it('returns existing pending duplicate', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'other' });
      mockUserSkillRepository.findById.mockResolvedValue({
        id: 'skill',
        userId: 'other',
        title: 'Skill',
        type: 'teach',
        subcategoryId: 10,
        categoryId: 1
      });
      const existing = buildRequestRecord({ id: 'req-1' });
      mockRequestRepository.findPendingDuplicate.mockResolvedValue(existing);

      const result = await requestService.createRequest('me', 'other', 'skill');
      expect(result).toMatchObject({ id: 'req-1', userSkillId: 'skill' });
      expect(mockRequestRepository.create).not.toHaveBeenCalled();
    });

    it('creates new request when none exists', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'other' });
      mockUserSkillRepository.findById.mockResolvedValue({
        id: 'skill',
        userId: 'other',
        title: 'Skill',
        type: 'teach',
        subcategoryId: 10,
        categoryId: 1
      });
      mockRequestRepository.findPendingDuplicate.mockResolvedValue(null);
      mockRequestRepository.create.mockResolvedValue(
        buildRequestRecord({ id: 'new' })
      );

      const result = await requestService.createRequest('me', 'other', 'skill');
      expect(mockRequestRepository.create).toHaveBeenCalledWith({
        fromUserId: 'me',
        toUserId: 'other',
        userSkillId: 'skill',
        skillTitle: 'Skill',
        skillType: 'teach',
        skillSubcategoryId: 10,
        skillCategoryId: 1
      });
      expect(result).toMatchObject({ id: 'new', userSkillId: 'skill' });
    });
  });

  describe('updateStatus', () => {
    it('rejects invalid status', async () => {
      const invalidStatus = 'unknown' as RequestStatus;
      await expect(
        requestService.updateStatus('req', 'user', invalidStatus)
      ).rejects.toMatchObject({ status: 400 });
    });

    it('throws when request missing', async () => {
      mockRequestRepository.findById.mockResolvedValue(null);
      await expect(
        requestService.updateStatus('req', 'user', 'pending')
      ).rejects.toMatchObject({ status: 404 });
    });

    it('throws when user is not participant', async () => {
      mockRequestRepository.findById.mockResolvedValue(
        buildRequestRecord({ fromUserId: 'a', toUserId: 'b' })
      );
      await expect(
        requestService.updateStatus('req', 'outsider', 'rejected')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('throws when accepting and current user is not recipient', async () => {
      mockRequestRepository.findById.mockResolvedValue(
        buildRequestRecord({ fromUserId: 'me', toUserId: 'other' })
      );
      await expect(
        requestService.updateStatus('req', 'me', 'accepted')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('returns early when status unchanged', async () => {
      mockRequestRepository.findById.mockResolvedValue(
        buildRequestRecord({ status: 'pending' })
      );

      const result = await requestService.updateStatus('req', 'me', 'pending');
      expect(result).toMatchObject({ status: 'pending' });
      expect(mockRequestRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('updates status and ensures exchange when accepted', async () => {
      const request = buildRequestRecord({
        id: 'req',
        fromUserId: 'me',
        toUserId: 'other',
        status: 'pending'
      });
      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.updateStatus.mockResolvedValue({
        ...request,
        status: 'accepted'
      });

      const result = await requestService.updateStatus(
        'req',
        'other',
        'accepted'
      );

      expect(mockRequestRepository.updateStatus).toHaveBeenCalledWith(
        'req',
        'accepted',
        expect.anything()
      );
      expect(mockExchangeService.ensureCreatedFromRequest).toHaveBeenCalledWith(
        { ...request, status: 'accepted' },
        expect.anything()
      );
      expect(result.status).toBe('accepted');
    });
  });
});
