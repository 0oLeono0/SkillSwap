import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode
} from 'react';
import styles from './profileAdminPanel.module.scss';
import { Title } from '@/shared/ui/Title';
import { Button } from '@/shared/ui/button/Button';
import { useAuth } from '@/app/providers/auth';
import { adminApi } from '@/shared/api/admin';
import type {
  ApiAdminUser,
  ApiAdminUsersSortBy,
  ApiAdminUsersSortDirection
} from '@/shared/api/users';
import type { UserRole } from '@/shared/types/userRole';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  ADMIN_DEFAULT_PAGE,
  useAdminListUrlState
} from './useAdminListUrlState';

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Пользователь',
  admin: 'Администратор',
  owner: 'Владелец'
};
const SORT_LABELS: Record<ApiAdminUsersSortBy, string> = {
  createdAt: 'дате создания',
  name: 'имени',
  email: 'e-mail',
  role: 'роли'
};

const ADMIN_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function ProfileAdminPanel(): ReactElement {
  const { user, accessToken } = useAuth();
  const {
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
  } = useAdminListUrlState();

  const [users, setUsers] = useState<ApiAdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const requestIdRef = useRef(0);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const normalizedTypedSearch = search.trim();
  const normalizedSearch = debouncedSearch.trim();
  const hasActiveSearch = normalizedSearch.length > 0;
  const isSearchDebouncing = normalizedTypedSearch !== normalizedSearch;
  const isOwner = user?.role === 'owner';

  const loadUsers = useCallback(
    async (
      nextPage: number,
      nextSearch: string | undefined,
      nextSortBy: ApiAdminUsersSortBy,
      nextSortDirection: ApiAdminUsersSortDirection
    ) => {
      if (!accessToken) {
        return;
      }

      const requestId = ++requestIdRef.current;
      setIsLoading(true);

      try {
        const response = await adminApi.fetchUsers(accessToken, {
          page: nextPage,
          pageSize: ADMIN_PAGE_SIZE,
          search: nextSearch,
          sortBy: nextSortBy,
          sortDirection: nextSortDirection
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setUsers(response.users);
        setPage(response.page);
        setTotalPages(response.totalPages);
        setTotalUsers(response.total);
        setSortBy(response.sortBy);
        setSortDirection(response.sortDirection);
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error('[ProfileAdminPanel] Failed to load users', err);
        setError(
          'Не удалось загрузить список пользователей. Попробуйте еще раз.'
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [accessToken, setPage, setSortBy, setSortDirection]
  );

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!isOwner) {
      return;
    }

    void loadUsers(page, normalizedSearch || undefined, sortBy, sortDirection);
  }, [isOwner, loadUsers, normalizedSearch, page, sortBy, sortDirection]);

  const pendingSet = useMemo(() => new Set(pendingIds), [pendingIds]);

  const handleToggleRole = useCallback(
    async (target: ApiAdminUser) => {
      if (!accessToken) {
        return;
      }

      const nextRole: 'admin' | 'user' =
        target.role === 'admin' ? 'user' : 'admin';

      setPendingIds((prev) =>
        prev.includes(target.id) ? prev : [...prev, target.id]
      );

      try {
        const response = await adminApi.updateUserRole(
          target.id,
          nextRole,
          accessToken
        );

        setUsers((prev) =>
          prev.map((entry) =>
            entry.id === response.user.id ? response.user : entry
          )
        );

        setError(null);
      } catch (err) {
        console.error('[ProfileAdminPanel] Failed to change role', err);
        setError('Не удалось обновить роль пользователя. Попробуйте снова.');
      } finally {
        setPendingIds((prev) => prev.filter((id) => id !== target.id));
      }
    },
    [accessToken]
  );

  const handleRefresh = useCallback(() => {
    void loadUsers(page, normalizedSearch || undefined, sortBy, sortDirection);
  }, [loadUsers, page, normalizedSearch, sortBy, sortDirection]);

  const handlePreviousPage = useCallback(() => {
    if (isLoading || page <= 1) {
      return;
    }

    setPage((prev) => Math.max(ADMIN_DEFAULT_PAGE, prev - 1));
  }, [isLoading, page, setPage]);

  const handleNextPage = useCallback(() => {
    if (isLoading || totalPages === 0 || page >= totalPages) {
      return;
    }

    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [isLoading, page, setPage, totalPages]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
      setPage(ADMIN_DEFAULT_PAGE);
    },
    [setPage, setSearch]
  );

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape' && search.length > 0) {
        clearSearch();
      }
    },
    [clearSearch, search.length]
  );

  const getSortLabel = useCallback(
    (column: ApiAdminUsersSortBy): string => {
      if (sortBy !== column) {
        return '↕';
      }
      return sortDirection === 'asc' ? '↑' : '↓';
    },
    [sortBy, sortDirection]
  );

  const getAriaSort = useCallback(
    (column: ApiAdminUsersSortBy): 'ascending' | 'descending' | 'none' => {
      if (sortBy !== column) {
        return 'none';
      }
      return sortDirection === 'asc' ? 'ascending' : 'descending';
    },
    [sortBy, sortDirection]
  );

  const highlightText = useCallback(
    (value: string): ReactNode => {
      if (!hasActiveSearch) {
        return value;
      }

      const pattern = new RegExp(`(${escapeRegExp(normalizedSearch)})`, 'ig');
      const parts = value.split(pattern);

      if (parts.length <= 1) {
        return value;
      }

      return parts.map((part, index) =>
        part.toLowerCase() === normalizedSearch.toLowerCase() ? (
          <mark key={`${value}-${index}`} className={styles.match}>
            {part}
          </mark>
        ) : (
          part
        )
      );
    },
    [hasActiveSearch, normalizedSearch]
  );

  const renderRows = useCallback(() => {
    if (isLoading && users.length === 0) {
      return (
        <tr>
          <td colSpan={4} className={styles.loading}>
            Загружаем данные...
          </td>
        </tr>
      );
    }

    if (!users.length) {
      return (
        <tr>
          <td colSpan={4} className={styles.empty}>
            {hasActiveSearch
              ? `По запросу "${normalizedSearch}" ничего не найдено`
              : 'Пользователи не найдены'}
          </td>
        </tr>
      );
    }

    return users.map((entry) => {
      const isSelf = entry.id === user?.id;
      const isOwnerRole = entry.role === 'owner';
      const isBusy = pendingSet.has(entry.id);
      const actionDisabled = isOwnerRole || isSelf || isBusy;
      const actionLabel =
        entry.role === 'admin' ? 'Снять права' : 'Назначить админом';

      return (
        <tr key={entry.id} className={styles.row}>
          <td>{highlightText(entry.name)}</td>
          <td>{highlightText(entry.email)}</td>
          <td>{ROLE_LABELS[entry.role]}</td>
          <td>
            {isOwnerRole ? (
              <span className={styles.hint}>Недоступно</span>
            ) : (
              <Button
                variant='secondary'
                onClick={() => handleToggleRole(entry)}
                disabled={actionDisabled}
              >
                {isBusy ? 'Сохраняем...' : actionLabel}
              </Button>
            )}
          </td>
        </tr>
      );
    });
  }, [
    hasActiveSearch,
    highlightText,
    isLoading,
    normalizedSearch,
    pendingSet,
    handleToggleRole,
    user?.id,
    users
  ]);

  if (!isOwner) {
    return (
      <section className={styles.panel}>
        <Title tag='h2' variant='lg'>
          Управление администраторами
        </Title>
        <p className={styles.restricted}>
          Только владелец проекта может просматривать и изменять роли.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-busy={isLoading}>
      <div className={styles.header}>
        <div>
          <Title tag='h2' variant='lg'>
            Управление администраторами
          </Title>
          <p className={styles.subtitle}>
            Назначайте администраторов и при необходимости оперативно отзывайте
            права доступа.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant='secondary'
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Обновляем...' : 'Обновить список'}
          </Button>
          <Button
            variant='secondary'
            onClick={resetView}
            disabled={!canResetView}
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.searchRow}>
        <input
          type='search'
          className={styles.searchInput}
          placeholder='Поиск по имени или e-mail'
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          aria-label='Поиск пользователя'
        />
        <Button
          variant='secondary'
          onClick={clearSearch}
          disabled={search.length === 0}
        >
          Сбросить
        </Button>
      </div>

      <p className={styles.searchMeta} role='status' aria-live='polite'>
        {isLoading
          ? 'Обновляем список...'
          : isSearchDebouncing
            ? 'Применяем фильтр...'
            : hasActiveSearch
              ? `Фильтр: "${normalizedSearch}". Найдено: ${totalUsers}. Сортировка по ${SORT_LABELS[sortBy]} (${sortDirection}).`
              : `Всего пользователей: ${totalUsers}. Сортировка по ${SORT_LABELS[sortBy]} (${sortDirection}).`}
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th aria-sort={getAriaSort('name')}>
                <button
                  type='button'
                  className={styles.sortButton}
                  onClick={() => handleSortChange('name')}
                >
                  Имя
                  <span
                    className={styles.sortIndicator}
                    aria-label={
                      sortBy === 'name'
                        ? `Сортировка по имени: ${sortDirection}`
                        : 'Сортировка по имени выключена'
                    }
                  >
                    {getSortLabel('name')}
                  </span>
                </button>
              </th>
              <th aria-sort={getAriaSort('email')}>
                <button
                  type='button'
                  className={styles.sortButton}
                  onClick={() => handleSortChange('email')}
                >
                  E-mail
                  <span
                    className={styles.sortIndicator}
                    aria-label={
                      sortBy === 'email'
                        ? `Сортировка по e-mail: ${sortDirection}`
                        : 'Сортировка по e-mail выключена'
                    }
                  >
                    {getSortLabel('email')}
                  </span>
                </button>
              </th>
              <th aria-sort={getAriaSort('role')}>
                <button
                  type='button'
                  className={styles.sortButton}
                  onClick={() => handleSortChange('role')}
                >
                  Роль
                  <span
                    className={styles.sortIndicator}
                    aria-label={
                      sortBy === 'role'
                        ? `Сортировка по роли: ${sortDirection}`
                        : 'Сортировка по роли выключена'
                    }
                  >
                    {getSortLabel('role')}
                  </span>
                </button>
              </th>
              <th aria-label='Действия'>Действия</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <span className={styles.meta}>Пользователей: {totalUsers}</span>
        <div className={styles.pagination}>
          <Button
            variant='secondary'
            onClick={handlePreviousPage}
            disabled={isLoading || page <= 1}
          >
            Назад
          </Button>
          <span className={styles.meta}>
            Страница {totalPages === 0 ? 0 : page} / {totalPages}
          </span>
          <Button
            variant='secondary'
            onClick={handleNextPage}
            disabled={isLoading || totalPages === 0 || page >= totalPages}
          >
            Вперед
          </Button>
        </div>
      </div>
    </section>
  );
}
