import { jest } from '@jest/globals';
import { loadFiltersBaseData, resetFiltersBaseDataCache } from '../model/filterBaseDataStore';
import type { FiltersBaseData } from '../model/filterBaseDataStore';
import { catalogApi } from '@/shared/api/catalog';

jest.mock('@/shared/api/catalog', () => ({
  catalogApi: {
    fetchFiltersBaseData: jest.fn(),
  },
}));

const asMock = <T extends (...args: unknown[]) => unknown>(fn: T) => fn as jest.MockedFunction<T>;

const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

const baseData: FiltersBaseData = {
  cities: [{ id: 1, name: 'City' }],
  skillGroups: [{ id: 1, name: 'Group', skills: [{ id: 10, name: 'Skill' }] }],
};

describe('filterBaseDataStore', () => {
  const fetchMock = asMock(catalogApi.fetchFiltersBaseData);
  let warnSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetFiltersBaseDataCache();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns cached data and avoids duplicate fetch calls', async () => {
    fetchMock.mockResolvedValueOnce(baseData);

    const first = await loadFiltersBaseData();
    const second = await loadFiltersBaseData();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(second).toEqual(baseData);
  });

  it('reuses the same pending promise for concurrent calls', async () => {
    const deferred = createDeferred<FiltersBaseData>();
    fetchMock.mockReturnValueOnce(deferred.promise);

    const firstPromise = loadFiltersBaseData();
    const secondPromise = loadFiltersBaseData();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    deferred.resolve(baseData);

    await expect(firstPromise).resolves.toEqual(baseData);
    await expect(secondPromise).resolves.toEqual(baseData);
  });

  it('forces refresh when requested', async () => {
    fetchMock
      .mockResolvedValueOnce(baseData)
      .mockResolvedValueOnce({
        cities: [{ id: 2, name: 'Another' }],
        skillGroups: [],
      });

    const first = await loadFiltersBaseData();
    const forced = await loadFiltersBaseData({ force: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(first).toEqual(baseData);
    expect(forced.cities[0].id).toBe(2);
  });

  it('resets pending after failure and allows force retry', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(baseData);

    const resultAfterError = await loadFiltersBaseData();

    expect(warnSpy).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(resultAfterError).toEqual({ cities: [], skillGroups: [] });

    const afterRetry = await loadFiltersBaseData({ force: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(afterRetry).toEqual(baseData);
  });
});
