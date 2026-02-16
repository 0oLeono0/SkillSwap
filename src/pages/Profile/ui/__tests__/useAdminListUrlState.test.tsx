import type { ReactNode } from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from '@testing-library/react';
import { MemoryRouter, useLocation, useSearchParams } from 'react-router-dom';
import {
  useAdminListUrlState,
  ADMIN_DEFAULT_PAGE,
  ADMIN_DEFAULT_SORT_BY,
  ADMIN_DEFAULT_SORT_DIRECTION
} from '../useAdminListUrlState';
import { ADMIN_LIST_QUERY_KEYS } from '../adminListUrlState.constants';

interface HookHarnessResult {
  readQuery: () => URLSearchParams;
}

const setup = (initialEntry = '/profile') => {
  const locationRef: { current: string } = { current: '' };

  function LocationProbe() {
    const location = useLocation();
    locationRef.current = location.search;
    return null;
  }

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      {children}
    </MemoryRouter>
  );

  const hook = renderHook(() => useAdminListUrlState(), {
    wrapper: Wrapper
  });

  const harness: HookHarnessResult = {
    readQuery: () =>
      new URLSearchParams(
        locationRef.current.startsWith('?')
          ? locationRef.current.slice(1)
          : locationRef.current
      )
  };

  return { ...hook, harness };
};

const profileQueryPath = (entries: Record<string, string>) => {
  const params = new URLSearchParams(entries);
  return `/profile?${params.toString()}`;
};

describe('useAdminListUrlState', () => {
  it('reads initial state from valid URL params', () => {
    const { result } = setup(
      profileQueryPath({
        [ADMIN_LIST_QUERY_KEYS.page]: '3',
        [ADMIN_LIST_QUERY_KEYS.search]: 'alice',
        [ADMIN_LIST_QUERY_KEYS.sortBy]: 'name',
        [ADMIN_LIST_QUERY_KEYS.sortDirection]: 'asc'
      })
    );

    expect(result.current.page).toBe(3);
    expect(result.current.search).toBe('alice');
    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.canResetView).toBe(true);
  });

  it('falls back to defaults for invalid URL params', () => {
    const { result } = setup(
      profileQueryPath({
        [ADMIN_LIST_QUERY_KEYS.page]: '0',
        [ADMIN_LIST_QUERY_KEYS.search]: '  ',
        [ADMIN_LIST_QUERY_KEYS.sortBy]: 'invalid',
        [ADMIN_LIST_QUERY_KEYS.sortDirection]: 'invalid'
      })
    );

    expect(result.current.page).toBe(ADMIN_DEFAULT_PAGE);
    expect(result.current.search).toBe('');
    expect(result.current.sortBy).toBe(ADMIN_DEFAULT_SORT_BY);
    expect(result.current.sortDirection).toBe(ADMIN_DEFAULT_SORT_DIRECTION);
    expect(result.current.canResetView).toBe(false);
  });

  it('clearSearch resets search and page and clears known query params', async () => {
    const { result, harness } = setup(
      profileQueryPath({
        [ADMIN_LIST_QUERY_KEYS.page]: '4',
        [ADMIN_LIST_QUERY_KEYS.search]: 'alice'
      })
    );

    act(() => {
      result.current.clearSearch();
    });

    await waitFor(() => {
      expect(result.current.search).toBe('');
      expect(result.current.page).toBe(ADMIN_DEFAULT_PAGE);
    });

    const params = harness.readQuery();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.search)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.page)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacyPage)).toBeNull();
  });

  it('resetView restores defaults and preserves unrelated query params', async () => {
    const { result, harness } = setup(
      profileQueryPath({
        [ADMIN_LIST_QUERY_KEYS.page]: '5',
        [ADMIN_LIST_QUERY_KEYS.search]: 'alice',
        [ADMIN_LIST_QUERY_KEYS.sortBy]: 'role',
        [ADMIN_LIST_QUERY_KEYS.sortDirection]: 'asc',
        tab: 'admins'
      })
    );

    act(() => {
      result.current.resetView();
    });

    await waitFor(() => {
      expect(result.current.page).toBe(ADMIN_DEFAULT_PAGE);
      expect(result.current.search).toBe('');
      expect(result.current.sortBy).toBe(ADMIN_DEFAULT_SORT_BY);
      expect(result.current.sortDirection).toBe(ADMIN_DEFAULT_SORT_DIRECTION);
    });

    const params = harness.readQuery();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.page)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacyPage)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.search)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.sortBy)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.sortDirection)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacySortBy)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacySortDirection)).toBeNull();
    expect(params.get('tab')).toBe('admins');
  });

  it('handleSortChange toggles direction on same column and resets page', async () => {
    const { result, harness } = setup(
      profileQueryPath({
        [ADMIN_LIST_QUERY_KEYS.page]: '7',
        [ADMIN_LIST_QUERY_KEYS.sortBy]: 'name',
        [ADMIN_LIST_QUERY_KEYS.sortDirection]: 'asc'
      })
    );

    act(() => {
      result.current.handleSortChange('name');
    });

    await waitFor(() => {
      expect(result.current.page).toBe(ADMIN_DEFAULT_PAGE);
      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortDirection).toBe('desc');
    });

    let params = harness.readQuery();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.sortBy)).toBe('name');
    expect(params.get(ADMIN_LIST_QUERY_KEYS.sortDirection)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.page)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacySortBy)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacySortDirection)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacyPage)).toBeNull();

    act(() => {
      result.current.handleSortChange('email');
    });

    await waitFor(() => {
      expect(result.current.sortBy).toBe('email');
      expect(result.current.sortDirection).toBe('asc');
    });

    params = harness.readQuery();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.sortBy)).toBe('email');
    expect(params.get(ADMIN_LIST_QUERY_KEYS.sortDirection)).toBe('asc');
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacySortBy)).toBeNull();
    expect(params.get(ADMIN_LIST_QUERY_KEYS.legacySortDirection)).toBeNull();
  });

  it('parses legacy page and sort params for backward compatibility', () => {
    const { result } = setup(
      profileQueryPath({
        [ADMIN_LIST_QUERY_KEYS.legacyPage]: '4',
        [ADMIN_LIST_QUERY_KEYS.legacySortBy]: 'email',
        [ADMIN_LIST_QUERY_KEYS.legacySortDirection]: 'asc'
      })
    );

    expect(result.current.page).toBe(4);
    expect(result.current.sortBy).toBe('email');
    expect(result.current.sortDirection).toBe('asc');
  });
});

const readState = () => screen.getByTestId('hook-state').textContent ?? '';

const HookStateView = () => {
  const { page, search, sortBy, sortDirection } = useAdminListUrlState();

  return (
    <output data-testid='hook-state'>
      {`${page}|${search}|${sortBy}|${sortDirection}`}
    </output>
  );
};

const ExternalQueryControls = () => {
  const [, setSearchParams] = useSearchParams();

  return (
    <>
      <button
        type='button'
        onClick={() => {
          setSearchParams(
            new URLSearchParams({
              [ADMIN_LIST_QUERY_KEYS.page]: '9',
              [ADMIN_LIST_QUERY_KEYS.search]: 'bob',
              [ADMIN_LIST_QUERY_KEYS.sortBy]: 'role',
              [ADMIN_LIST_QUERY_KEYS.sortDirection]: 'asc'
            })
          );
        }}
      >
        Apply Query
      </button>
      <button
        type='button'
        onClick={() => {
          setSearchParams('');
        }}
      >
        Clear Query
      </button>
    </>
  );
};

describe('useAdminListUrlState navigation', () => {
  it('syncs state on external query updates', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          profileQueryPath({
            [ADMIN_LIST_QUERY_KEYS.page]: '2',
            [ADMIN_LIST_QUERY_KEYS.search]: 'alice'
          })
        ]}
      >
        <ExternalQueryControls />
        <HookStateView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(readState()).toBe('2|alice|createdAt|desc');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Apply Query' }));

    await waitFor(() => {
      expect(readState()).toBe('9|bob|role|asc');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear Query' }));

    await waitFor(() => {
      expect(readState()).toBe('1||createdAt|desc');
    });
  });
});
