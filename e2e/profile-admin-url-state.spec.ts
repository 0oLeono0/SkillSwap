import { expect, test, type Page } from 'playwright/test';
import { ADMIN_LIST_QUERY_KEYS } from '../src/pages/Profile/ui/adminListUrlState.constants';

type AdminUsersRequestSnapshot = {
  page: string | null;
  search: string | null;
  sortBy: string | null;
  sortDirection: string | null;
};

const OWNER_ID = 'owner-1';

const makeOwnerAuthResponse = () => ({
  user: {
    id: OWNER_ID,
    email: 'owner@example.com',
    name: 'Owner User',
    role: 'owner',
    teachableSkills: [],
    learningSkills: []
  },
  accessToken: 'test-access-token'
});

const makeUsersResponse = (snapshot: AdminUsersRequestSnapshot) => {
  const page = Number(snapshot.page ?? '1');
  const resolvedPage = Number.isInteger(page) && page > 0 ? page : 1;
  const sortBy =
    snapshot.sortBy === 'name' ||
    snapshot.sortBy === 'email' ||
    snapshot.sortBy === 'role' ||
    snapshot.sortBy === 'createdAt'
      ? snapshot.sortBy
      : 'createdAt';
  const sortDirection =
    snapshot.sortDirection === 'asc' || snapshot.sortDirection === 'desc'
      ? snapshot.sortDirection
      : 'desc';

  return {
    users: [
      {
        id: 'user-1',
        name: snapshot.search?.length ? `User ${snapshot.search}` : 'User One',
        email: 'user.one@example.com',
        role: 'user'
      }
    ],
    page: resolvedPage,
    pageSize: 20,
    total: 1,
    totalPages: 1,
    sortBy,
    sortDirection
  };
};

const readQueryParam = (page: Page, key: string) =>
  page.evaluate(
    (nextKey) => new URLSearchParams(window.location.search).get(nextKey),
    key
  );

const installApiMocks = async (page: Page) => {
  let lastUsersRequest: AdminUsersRequestSnapshot | null = null;

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(makeOwnerAuthResponse())
    });
  });

  await page.route('**/api/admin/users**', async (route) => {
    const url = new URL(route.request().url());
    lastUsersRequest = {
      page: url.searchParams.get('page'),
      search: url.searchParams.get('search'),
      sortBy: url.searchParams.get('sortBy'),
      sortDirection: url.searchParams.get('sortDirection')
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(makeUsersResponse(lastUsersRequest))
    });
  });

  return {
    readLastUsersRequest: () => lastUsersRequest
  };
};

test.describe('Profile admin URL state', () => {
  test('uses scoped admin query keys and syncs URL after UI actions', async ({
    page
  }) => {
    const api = await installApiMocks(page);
    const query = new URLSearchParams({
      tab: 'admins',
      [ADMIN_LIST_QUERY_KEYS.page]: '2',
      [ADMIN_LIST_QUERY_KEYS.search]: 'alice',
      [ADMIN_LIST_QUERY_KEYS.sortBy]: 'email',
      [ADMIN_LIST_QUERY_KEYS.sortDirection]: 'asc'
    });

    await page.goto(`/profile/admin?${query.toString()}`);
    await expect(page.locator('input[type="search"]')).toHaveValue('alice');

    await expect.poll(() => api.readLastUsersRequest()?.page).toBe('2');
    await expect.poll(() => api.readLastUsersRequest()?.search).toBe('alice');
    await expect.poll(() => api.readLastUsersRequest()?.sortBy).toBe('email');
    await expect
      .poll(() => api.readLastUsersRequest()?.sortDirection)
      .toBe('asc');

    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.page))
      .toBe('2');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.search))
      .toBe('alice');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.legacyPage))
      .toBeNull();
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.legacySortBy))
      .toBeNull();
    await expect
      .poll(() =>
        readQueryParam(page, ADMIN_LIST_QUERY_KEYS.legacySortDirection)
      )
      .toBeNull();

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('bob');

    await expect.poll(() => api.readLastUsersRequest()?.search).toBe('bob');
    await expect.poll(() => api.readLastUsersRequest()?.page).toBe('1');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.search))
      .toBe('bob');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.page))
      .toBe(null);

    const resetFiltersButton = page
      .locator('section[aria-busy] > div')
      .first()
      .locator('button')
      .nth(1);
    await resetFiltersButton.click();

    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.search))
      .toBeNull();
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.sortBy))
      .toBeNull();
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.sortDirection))
      .toBeNull();
    await expect.poll(() => readQueryParam(page, 'tab')).toBe('admins');
  });

  test('migrates legacy query keys to scoped admin keys', async ({ page }) => {
    const api = await installApiMocks(page);
    const query = new URLSearchParams({
      [ADMIN_LIST_QUERY_KEYS.search]: 'alice',
      [ADMIN_LIST_QUERY_KEYS.legacyPage]: '4',
      [ADMIN_LIST_QUERY_KEYS.legacySortBy]: 'email',
      [ADMIN_LIST_QUERY_KEYS.legacySortDirection]: 'asc'
    });

    await page.goto(`/profile/admin?${query.toString()}`);
    await expect(page.locator('input[type="search"]')).toHaveValue('alice');

    await expect.poll(() => api.readLastUsersRequest()?.page).toBe('4');
    await expect.poll(() => api.readLastUsersRequest()?.search).toBe('alice');
    await expect.poll(() => api.readLastUsersRequest()?.sortBy).toBe('email');
    await expect
      .poll(() => api.readLastUsersRequest()?.sortDirection)
      .toBe('asc');

    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.page))
      .toBe('4');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.sortBy))
      .toBe('email');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.sortDirection))
      .toBe('asc');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.legacyPage))
      .toBeNull();
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.legacySortBy))
      .toBeNull();
    await expect
      .poll(() =>
        readQueryParam(page, ADMIN_LIST_QUERY_KEYS.legacySortDirection)
      )
      .toBeNull();
  });

  test('preserves unrelated query params during admin filters interactions', async ({
    page
  }) => {
    const api = await installApiMocks(page);
    const query = new URLSearchParams({
      tab: 'admins',
      [ADMIN_LIST_QUERY_KEYS.page]: '3',
      [ADMIN_LIST_QUERY_KEYS.search]: 'alice',
      [ADMIN_LIST_QUERY_KEYS.sortBy]: 'name',
      [ADMIN_LIST_QUERY_KEYS.sortDirection]: 'asc'
    });

    await page.goto(`/profile/admin?${query.toString()}`);
    await expect(page.locator('input[type="search"]')).toHaveValue('alice');
    await expect.poll(() => readQueryParam(page, 'tab')).toBe('admins');

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('bob');

    await expect.poll(() => api.readLastUsersRequest()?.search).toBe('bob');
    await expect.poll(() => api.readLastUsersRequest()?.page).toBe('1');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.search))
      .toBe('bob');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.page))
      .toBeNull();
    await expect.poll(() => readQueryParam(page, 'tab')).toBe('admins');

    const emailSortButton = page.getByRole('button', { name: /^E-mail/ });
    await emailSortButton.click();

    await expect.poll(() => api.readLastUsersRequest()?.sortBy).toBe('email');
    await expect
      .poll(() => api.readLastUsersRequest()?.sortDirection)
      .toBe('asc');
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.sortBy))
      .toBe('email');
    await expect.poll(() => readQueryParam(page, 'tab')).toBe('admins');

    const clearSearchButton = page.getByRole('button', { name: /^Сбросить$/ });
    await clearSearchButton.click();

    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.search))
      .toBeNull();
    await expect.poll(() => readQueryParam(page, 'tab')).toBe('admins');

    const resetFiltersButton = page.getByRole('button', {
      name: /^Сбросить фильтры$/
    });
    await resetFiltersButton.click();

    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.sortBy))
      .toBeNull();
    await expect
      .poll(() => readQueryParam(page, ADMIN_LIST_QUERY_KEYS.sortDirection))
      .toBeNull();
    await expect.poll(() => readQueryParam(page, 'tab')).toBe('admins');
  });
});
