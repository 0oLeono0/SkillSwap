import { renderHook, waitFor, act } from '@testing-library/react';
import { useFiltersBaseData } from '../model/useFiltersBaseData';
import { loadFiltersBaseData, resetFiltersBaseDataCache } from '../model/filterBaseDataStore';
import type { FiltersBaseData } from '../model/filterBaseDataStore';
import { catalogApi } from '@/shared/api/catalog';

jest.mock('@/shared/api/catalog', () => ({
  catalogApi: {
    fetchFiltersBaseData: jest.fn(),
  },
}));

const asMock = <T extends (...args: unknown[]) => unknown>(fn: T) => fn as jest.MockedFunction<T>;
const fetchMock = asMock(catalogApi.fetchFiltersBaseData);

const baseData: FiltersBaseData = {
  cities: [{ id: 1, name: 'CachedCity' }],
  skillGroups: [{ id: 1, name: 'CachedGroup', skills: [{ id: 11, name: 'Skill' }] }],
};

const nextData: FiltersBaseData = {
  cities: [{ id: 2, name: 'NextCity' }],
  skillGroups: [{ id: 2, name: 'NextGroup', skills: [{ id: 22, name: 'Skill2' }] }],
};

describe('useFiltersBaseData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetFiltersBaseDataCache();
  });

  it('returns cached data immediately when cache is warm', async () => {
    fetchMock.mockResolvedValueOnce(baseData);
    await loadFiltersBaseData();
    fetchMock.mockClear();

    const { result } = renderHook(() => useFiltersBaseData());

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.cities).toEqual(baseData.cities);
  });

  it('fetches data on mount when cache is empty', async () => {
    fetchMock.mockResolvedValueOnce(baseData);

    const { result } = renderHook(() => useFiltersBaseData());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.cities).toEqual(baseData.cities);
    expect(result.current.error).toBeNull();
  });

  it('refetch forces new request even when cache exists', async () => {
    fetchMock.mockResolvedValueOnce(baseData);
    await loadFiltersBaseData();
    fetchMock.mockClear();
    fetchMock.mockResolvedValueOnce(nextData);

    const { result } = renderHook(() => useFiltersBaseData());

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.cities).toEqual(nextData.cities);
  });
});
