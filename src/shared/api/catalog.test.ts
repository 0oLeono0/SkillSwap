const mockRequest = jest.fn();

jest.mock('@/shared/api/request', () => ({
  request: mockRequest
}));

import { catalogApi } from './catalog';

describe('catalogApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({
      authors: [],
      page: 1,
      pageSize: 12,
      totalAuthors: 0
    });
  });

  it('adds user status to catalog search query string', async () => {
    await catalogApi.search({
      mode: 'all',
      status: 'active',
      page: 1,
      pageSize: 12
    });

    expect(mockRequest).toHaveBeenCalledWith(
      '/catalog/search?mode=all&status=active&page=1&pageSize=12',
      undefined
    );
  });
});
