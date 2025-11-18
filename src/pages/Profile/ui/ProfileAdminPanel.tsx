import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react';
import styles from './profileAdminPanel.module.scss';
import { Title } from '@/shared/ui/Title';
import { Button } from '@/shared/ui/button/Button';
import { useAuth } from '@/app/providers/auth';
import { adminApi } from '@/shared/api/admin';
import type { ApiAuthUser } from '@/shared/api/auth';
import type { UserRole } from '@/shared/types/userRole';

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Пользователь',
  admin: 'Администратор',
  owner: 'Владелец',
};

export function ProfileAdminPanel(): ReactElement {
  const { user, accessToken } = useAuth();
  const [users, setUsers] = useState<ApiAuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const isOwner = user?.role === 'owner';

  const loadUsers = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await adminApi.fetchUsers(accessToken);
      setUsers(response.users);
      setError(null);
    } catch (err) {
      console.error('[ProfileAdminPanel] Failed to load users', err);
      setError('Не удалось загрузить список пользователей. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isOwner) {
      void loadUsers();
    }
  }, [isOwner, loadUsers]);

  const pendingSet = useMemo(
    () => new Set(pendingIds),
    [pendingIds],
  );

  const handleToggleRole = useCallback(
    async (target: ApiAuthUser) => {
      if (!accessToken) {
        return;
      }
      const nextRole: 'admin' | 'user' = target.role === 'admin' ? 'user' : 'admin';
      setPendingIds((prev) =>
        prev.includes(target.id) ? prev : [...prev, target.id],
      );
      try {
        const response = await adminApi.updateUserRole(target.id, nextRole, accessToken);
        setUsers((prev) =>
          prev.map((entry) =>
            entry.id === response.user.id ? response.user : entry,
          ),
        );
        setError(null);
      } catch (err) {
        console.error('[ProfileAdminPanel] Failed to change role', err);
        setError('Не удалось обновить роль пользователя. Попробуйте снова.');
      } finally {
        setPendingIds((prev) => prev.filter((id) => id !== target.id));
      }
    },
    [accessToken],
  );

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

  const renderRows = () => {
    if (!users.length && !isLoading) {
      return (
        <tr>
          <td colSpan={4} className={styles.empty}>
            Пользователи не найдены
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
        <tr key={entry.id}>
          <td>{entry.name}</td>
          <td>{entry.email}</td>
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
                {isBusy ? 'Сохраняем…' : actionLabel}
              </Button>
            )}
          </td>
        </tr>
      );
    });
  };

  return (
    <section className={styles.panel}>
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
        <Button variant='secondary' onClick={loadUsers} disabled={isLoading}>
          {isLoading ? 'Обновляем…' : 'Обновить список'}
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>E-mail</th>
              <th>Роль</th>
              <th aria-label='Действия'>Действия</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </section>
  );
}
