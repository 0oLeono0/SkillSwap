import { useEffect, useState } from 'react';
import type { FiltersBaseData } from './filterBaseDataStore';
import { getCachedFiltersBaseData, loadFiltersBaseData } from './filterBaseDataStore';

interface HookState extends FiltersBaseData {
  isLoading: boolean;
  error: string | null;
}

const initialState: HookState = {
  cities: [],
  skillGroups: [],
  isLoading: true,
  error: null,
};

export const useFiltersBaseData = (): HookState => {
  const [state, setState] = useState<HookState>(() => {
    const cached = getCachedFiltersBaseData();
    if (cached) {
      return { ...cached, isLoading: false, error: null };
    }
    return initialState;
  });

  useEffect(() => {
    if (!state.isLoading && !state.error && state.cities.length && state.skillGroups.length) {
      return;
    }

    let isMounted = true;
    loadFiltersBaseData()
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setState({
          ...data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load filter data',
        }));
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};
