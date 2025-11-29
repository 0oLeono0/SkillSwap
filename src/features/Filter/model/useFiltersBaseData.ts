import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FiltersBaseData } from './filterBaseDataStore';
import { getCachedFiltersBaseData, loadFiltersBaseData } from './filterBaseDataStore';

interface HookState extends FiltersBaseData {
  isLoading: boolean;
  error: string | null;
}

interface HookResult extends HookState {
  refetch: () => Promise<void>;
}

const initialState: HookState = {
  cities: [],
  skillGroups: [],
  isLoading: true,
  error: null,
};

export const useFiltersBaseData = (): HookResult => {
  const [state, setState] = useState<HookState>(() => {
    const cached = getCachedFiltersBaseData();
    if (cached) {
      return { ...cached, isLoading: false, error: null };
    }
    return initialState;
  });
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  const safeSetState = useCallback(
    (updater: Parameters<typeof setState>[0]) => {
      if (!isMountedRef.current) {
        return;
      }
      setState(updater);
    },
    [],
  );

  const performLoad = useCallback(async (force = false) => {
    safeSetState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await loadFiltersBaseData({ force });
      safeSetState({
        ...data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      safeSetState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load filter data',
      }));
    }
  }, [safeSetState]);

  useEffect(() => {
    if (state.cities.length && state.skillGroups.length) {
      return;
    }

    performLoad().catch(() => undefined);
  }, [performLoad, state.cities.length, state.skillGroups.length]);

  const refetch = useCallback(() => performLoad(true), [performLoad]);

  return useMemo(
    () => ({
      ...state,
      refetch,
    }),
    [state, refetch],
  );
};
