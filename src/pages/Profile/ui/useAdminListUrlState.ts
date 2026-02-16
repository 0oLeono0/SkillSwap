import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SetStateAction
} from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  ApiAdminUsersSortBy,
  ApiAdminUsersSortDirection
} from '@/shared/api/users';
import { ADMIN_LIST_QUERY_KEYS } from './adminListUrlState.constants';

export const ADMIN_DEFAULT_PAGE = 1;
export const ADMIN_DEFAULT_SORT_BY: ApiAdminUsersSortBy = 'createdAt';
export const ADMIN_DEFAULT_SORT_DIRECTION: ApiAdminUsersSortDirection = 'desc';

const SEARCH_PARAM_PAGE = ADMIN_LIST_QUERY_KEYS.legacyPage;
const SEARCH_PARAM_SEARCH = ADMIN_LIST_QUERY_KEYS.search;
const SEARCH_PARAM_SORT_BY = ADMIN_LIST_QUERY_KEYS.legacySortBy;
const SEARCH_PARAM_SORT_DIRECTION = ADMIN_LIST_QUERY_KEYS.legacySortDirection;
const SEARCH_PARAM_PAGE_NEXT = ADMIN_LIST_QUERY_KEYS.page;
const SEARCH_PARAM_SORT_BY_NEXT = ADMIN_LIST_QUERY_KEYS.sortBy;
const SEARCH_PARAM_SORT_DIRECTION_NEXT = ADMIN_LIST_QUERY_KEYS.sortDirection;
const TABLE_SORT_COLUMNS: ApiAdminUsersSortBy[] = ['name', 'email', 'role'];
const SORT_BY_VALUES: ApiAdminUsersSortBy[] = [
  ADMIN_DEFAULT_SORT_BY,
  ...TABLE_SORT_COLUMNS
];
const SORT_DIRECTION_VALUES: ApiAdminUsersSortDirection[] = ['asc', 'desc'];

const parsePositiveInt = (value: string | null, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const parseSortBy = (value: string | null): ApiAdminUsersSortBy => {
  if (!value) {
    return ADMIN_DEFAULT_SORT_BY;
  }

  return SORT_BY_VALUES.includes(value as ApiAdminUsersSortBy)
    ? (value as ApiAdminUsersSortBy)
    : ADMIN_DEFAULT_SORT_BY;
};

const parseSortDirection = (
  value: string | null
): ApiAdminUsersSortDirection => {
  if (!value) {
    return ADMIN_DEFAULT_SORT_DIRECTION;
  }

  return SORT_DIRECTION_VALUES.includes(value as ApiAdminUsersSortDirection)
    ? (value as ApiAdminUsersSortDirection)
    : ADMIN_DEFAULT_SORT_DIRECTION;
};

interface AdminListUrlState {
  search: string;
  page: number;
  sortBy: ApiAdminUsersSortBy;
  sortDirection: ApiAdminUsersSortDirection;
}

const resolveQueryValue = (
  params: URLSearchParams,
  primaryKey: string,
  legacyKey?: string
) => params.get(primaryKey) ?? (legacyKey ? params.get(legacyKey) : null);

export const useAdminListUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsRef = useRef(searchParams.toString());
  const skipNextUrlSyncRef = useRef(false);
  searchParamsRef.current = searchParams.toString();

  const [state, setState] = useState<AdminListUrlState>(() => ({
    search: (searchParams.get(SEARCH_PARAM_SEARCH) ?? '').trim(),
    page: parsePositiveInt(
      resolveQueryValue(
        searchParams,
        SEARCH_PARAM_PAGE_NEXT,
        SEARCH_PARAM_PAGE
      ),
      ADMIN_DEFAULT_PAGE
    ),
    sortBy: parseSortBy(
      resolveQueryValue(
        searchParams,
        SEARCH_PARAM_SORT_BY_NEXT,
        SEARCH_PARAM_SORT_BY
      )
    ),
    sortDirection: parseSortDirection(
      resolveQueryValue(
        searchParams,
        SEARCH_PARAM_SORT_DIRECTION_NEXT,
        SEARCH_PARAM_SORT_DIRECTION
      )
    )
  }));
  const stateRef = useRef(state);
  stateRef.current = state;

  const setSearch = useCallback((value: SetStateAction<string>) => {
    setState((prev) => ({
      ...prev,
      search: typeof value === 'function' ? value(prev.search) : value
    }));
  }, []);

  const setPage = useCallback((value: SetStateAction<number>) => {
    setState((prev) => ({
      ...prev,
      page: typeof value === 'function' ? value(prev.page) : value
    }));
  }, []);

  const setSortBy = useCallback(
    (value: SetStateAction<ApiAdminUsersSortBy>) => {
      setState((prev) => ({
        ...prev,
        sortBy: typeof value === 'function' ? value(prev.sortBy) : value
      }));
    },
    []
  );

  const setSortDirection = useCallback(
    (value: SetStateAction<ApiAdminUsersSortDirection>) => {
      setState((prev) => ({
        ...prev,
        sortDirection:
          typeof value === 'function' ? value(prev.sortDirection) : value
      }));
    },
    []
  );

  const { search, page, sortBy, sortDirection } = state;

  useEffect(() => {
    const nextSearch = (searchParams.get(SEARCH_PARAM_SEARCH) ?? '').trim();
    const nextPage = parsePositiveInt(
      resolveQueryValue(
        searchParams,
        SEARCH_PARAM_PAGE_NEXT,
        SEARCH_PARAM_PAGE
      ),
      ADMIN_DEFAULT_PAGE
    );
    const nextSortBy = parseSortBy(
      resolveQueryValue(
        searchParams,
        SEARCH_PARAM_SORT_BY_NEXT,
        SEARCH_PARAM_SORT_BY
      )
    );
    const nextSortDirection = parseSortDirection(
      resolveQueryValue(
        searchParams,
        SEARCH_PARAM_SORT_DIRECTION_NEXT,
        SEARCH_PARAM_SORT_DIRECTION
      )
    );

    const shouldSyncFromUrl =
      nextSearch !== stateRef.current.search ||
      nextPage !== stateRef.current.page ||
      nextSortBy !== stateRef.current.sortBy ||
      nextSortDirection !== stateRef.current.sortDirection;

    if (!shouldSyncFromUrl) {
      return;
    }

    skipNextUrlSyncRef.current = true;
    setState({
      search: nextSearch,
      page: nextPage,
      sortBy: nextSortBy,
      sortDirection: nextSortDirection
    });
  }, [searchParams]);

  useEffect(() => {
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }

    const params = new URLSearchParams(searchParamsRef.current);

    if (page > ADMIN_DEFAULT_PAGE) {
      params.set(SEARCH_PARAM_PAGE_NEXT, String(page));
      params.delete(SEARCH_PARAM_PAGE);
    } else {
      params.delete(SEARCH_PARAM_PAGE_NEXT);
      params.delete(SEARCH_PARAM_PAGE);
    }
    if (search.trim().length > 0) {
      params.set(SEARCH_PARAM_SEARCH, search.trim());
    } else {
      params.delete(SEARCH_PARAM_SEARCH);
    }
    if (sortBy !== ADMIN_DEFAULT_SORT_BY) {
      params.set(SEARCH_PARAM_SORT_BY_NEXT, sortBy);
      params.delete(SEARCH_PARAM_SORT_BY);
    } else {
      params.delete(SEARCH_PARAM_SORT_BY_NEXT);
      params.delete(SEARCH_PARAM_SORT_BY);
    }
    if (sortDirection !== ADMIN_DEFAULT_SORT_DIRECTION) {
      params.set(SEARCH_PARAM_SORT_DIRECTION_NEXT, sortDirection);
      params.delete(SEARCH_PARAM_SORT_DIRECTION);
    } else {
      params.delete(SEARCH_PARAM_SORT_DIRECTION_NEXT);
      params.delete(SEARCH_PARAM_SORT_DIRECTION);
    }

    const next = params.toString();
    const current = searchParamsRef.current;

    if (next !== current) {
      searchParamsRef.current = next;
      setSearchParams(params, { replace: true });
    }
  }, [page, search, setSearchParams, sortBy, sortDirection]);

  const clearSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      search: '',
      page: ADMIN_DEFAULT_PAGE
    }));
  }, []);

  const resetView = useCallback(() => {
    setState((prev) => ({
      ...prev,
      search: '',
      page: ADMIN_DEFAULT_PAGE,
      sortBy: ADMIN_DEFAULT_SORT_BY,
      sortDirection: ADMIN_DEFAULT_SORT_DIRECTION
    }));
  }, []);

  const handleSortChange = useCallback((column: ApiAdminUsersSortBy) => {
    if (!TABLE_SORT_COLUMNS.includes(column)) {
      return;
    }
    setState((prev) => ({
      ...prev,
      page: ADMIN_DEFAULT_PAGE,
      sortBy: column,
      sortDirection:
        prev.sortBy === column
          ? prev.sortDirection === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc'
    }));
  }, []);

  const hasNonDefaultSort =
    sortBy !== ADMIN_DEFAULT_SORT_BY ||
    sortDirection !== ADMIN_DEFAULT_SORT_DIRECTION;
  const canResetView =
    search.length > 0 || hasNonDefaultSort || page > ADMIN_DEFAULT_PAGE;

  return {
    search,
    setSearch,
    page,
    setPage,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    canResetView,
    clearSearch,
    resetView,
    handleSortChange
  };
};
