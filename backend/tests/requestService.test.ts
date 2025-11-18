import { jest } from '@jest/globals';
import { HttpError } from '../src/utils/httpErrors.js';

const mockRequestRepository = {
  findForUser: jest.fn(),
  findPendingDuplicate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateStatus: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
};

const mockExchangeService = {
  ensureCreatedFromRequest: jest.fn(),
};

jest.unstable_mockModule('../src/repositories/requestRepository.js', () => ({
  requestRepository: mockRequestRepository,
}));

jest.unstable_mockModule('../src/repositories/userRepository.js', () => ({
  userRepository: mockUserRepository,
}));

jest.unstable_mockModule('../src/services/exchangeService.js', () => ({
  exchangeService: mockExchangeService,
}));

const { requestService } = await import('../src/services/requestService.js');

describe('requestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listForUser', () => {
    it('splits requests into incoming and outgoing', async () => {
      mockRequestRepository.findForUser.mockResolvedValue([
        { id: '1', toUserId: 'me', fromUserId: 'u1' },
        { id: '2', toUserId: 'u2', fromUserId: 'me' },
      ]);

      const result = await requestService.listForUser('me');

      expect(result).toEqual({
        incoming: [{ id: '1', toUserId: 'me', fromUserId: 'u1' }],
        outgoing: [{ id: '2', toUserId: 'u2', fromUserId: 'me' }],
      });
    });
  });

  describe('createRequest', () => {
    it('throws when users are equal', async () => {
      await expect(requestService.createRequest('me', 'me', 'skill')).rejects.toMatchObject({ status: 400 });
    });

    it('throws when target user missing', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(requestService.createRequest('me', 'other', 'skill')).rejects.toMatchObject({ status: 404 });
    });

    it('returns existing pending duplicate', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'other' });
      const existing = { id: 'req' };
      mockRequestRepository.findPendingDuplicate.mockResolvedValue(existing);

      const result = await requestService.createRequest('me', 'other', 'skill');
      expect(result).toBe(existing);
      expect(mockRequestRepository.create).not.toHaveBeenCalled();
    });

    it('creates new request when none exists', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'other' });
      mockRequestRepository.findPendingDuplicate.mockResolvedValue(null);
      mockRequestRepository.create.mockResolvedValue({ id: 'new' });

      const result = await requestService.createRequest('me', 'other', 'skill');
      expect(mockRequestRepository.create).toHaveBeenCalledWith({
        fromUserId: 'me',
        toUserId: 'other',
        skillId: 'skill',
      });
      expect(result).toEqual({ id: 'new' });
    });
  });

  describe('updateStatus', () => {
    it('rejects invalid status', async () => {
      await expect(requestService.updateStatus('req', 'user', 'unknown')).rejects.toMatchObject({ status: 400 });
    });

    it('throws when request missing', async () => {
      mockRequestRepository.findById.mockResolvedValue(null);
      await expect(requestService.updateStatus('req', 'user', 'pending')).rejects.toMatchObject({ status: 404 });
    });

    it('throws when user is not participant', async () => {
      mockRequestRepository.findById.mockResolvedValue({
        id: 'req',
        fromUserId: 'a',
        toUserId: 'b',
        status: 'pending',
      });
      await expect(requestService.updateStatus('req', 'outsider', 'rejected')).rejects.toMatchObject({ status: 403 });
    });

    it('throws when accepting and current user is not recipient', async () => {
      mockRequestRepository.findById.mockResolvedValue({
        id: 'req',
        fromUserId: 'me',
        toUserId: 'other',
        status: 'pending',
      });
      await expect(requestService.updateStatus('req', 'me', 'accepted')).rejects.toMatchObject({ status: 403 });
    });

    it('returns early when status unchanged', async () => {
      const request = { id: 'req', fromUserId: 'me', toUserId: 'other', status: 'pending' };
      mockRequestRepository.findById.mockResolvedValue(request);

      const result = await requestService.updateStatus('req', 'me', 'pending');
      expect(result).toBe(request);
      expect(mockRequestRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('updates status and ensures exchange when accepted', async () => {
      const request = { id: 'req', fromUserId: 'me', toUserId: 'other', status: 'pending' };
      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.updateStatus.mockResolvedValue({ ...request, status: 'accepted' });

      const result = await requestService.updateStatus('req', 'other', 'accepted');

      expect(mockRequestRepository.updateStatus).toHaveBeenCalledWith('req', 'accepted');
      expect(mockExchangeService.ensureCreatedFromRequest).toHaveBeenCalledWith({ ...request, status: 'accepted' });
      expect(result.status).toBe('accepted');
    });
  });
});

