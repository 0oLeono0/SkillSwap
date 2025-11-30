import { renderHook, waitFor } from '@testing-library/react';
import { useFiltersBaseData } from './useFiltersBaseData';
import type { FiltersBaseData } from './filterBaseDataStore';

const sampleData: FiltersBaseData = {
  cities: [{ id: 1, name: 'Minsk' }],
  skillGroups: [{ id: 10, name: 'Group', skills: [{ id: 100, name: 'Skill' }] }],
};

const mockGetCachedFiltersBaseData = jest.fn();
const mockLoadFiltersBaseData = jest.fn();

jest.mock('./filterBaseDataStore', () => ({
  getCachedFiltersBaseData: () => mockGetCachedFiltersBaseData(),
  loadFiltersBaseData: () => mockLoadFiltersBaseData(),
}));

describe('useFiltersBaseData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached data immediately without loading', () => {
    mockGetCachedFiltersBaseData.mockReturnValue(sampleData);

    const { result } = renderHook(() => useFiltersBaseData());

    expect(result.current.cities).toEqual(sampleData.cities);
    expect(result.current.skillGroups).toEqual(sampleData.skillGroups);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockLoadFiltersBaseData).not.toHaveBeenCalled();
  });

  it('loads data when cache is empty', async () => {
    mockGetCachedFiltersBaseData.mockReturnValue(null);
    mockLoadFiltersBaseData.mockResolvedValue(sampleData);

    const { result } = renderHook(() => useFiltersBaseData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockLoadFiltersBaseData).toHaveBeenCalledTimes(1);
    expect(result.current.cities).toEqual(sampleData.cities);
    expect(result.current.skillGroups).toEqual(sampleData.skillGroups);
    expect(result.current.error).toBeNull();
  });
});
