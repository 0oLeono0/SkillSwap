import { useCallback, useEffect, useState, type ReactElement } from 'react';
import clsx from 'clsx';
import styles from './profileRequests.module.scss';
import { Title } from '@/shared/ui/Title';
import { Button } from '@/shared/ui/button/Button';
import { useAuth } from '@/app/providers/auth';
import type { Request, RequestStatus } from '@/entities/Request/types';
import { getSubskillNameMap } from '@/entities/Skill/mappers';
import { loadFiltersBaseData } from '@/features/Filter/model/filterBaseDataStore';
import { requestsApi } from '@/shared/api/requests';
import {
  acceptRequest,
  rejectRequest
} from '@/features/requests/model/actions';

type RequestDirection = 'incoming' | 'outgoing';

interface SkillMeta {
  title: string;
  type: 'teach' | 'learn';
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'В ожидании',
  accepted: 'Одобрена',
  rejected: 'Отклонена'
};

const STATUS_HINTS: Record<RequestStatus, string> = {
  pending: 'Ждёт решения другой стороны.',
  accepted: 'Можно переходить к деталям обмена.',
  rejected: 'Эта заявка закрыта.'
};

const SKILL_TYPE_LABEL: Record<SkillMeta['type'], string> = {
  teach: 'Навык, который готовы передать',
  learn: 'Навык, которому ищут наставника'
};

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const parseSkillMeta = (
  skill: Request['skill'] | undefined,
  titleById: Map<number, string>
): SkillMeta => {
  const type = skill?.type ?? 'teach';
  const subskillId = skill?.subcategoryId;
  const hasSubskillId = typeof subskillId === 'number';
  const fallbackTitle = hasSubskillId ? `Навык #${subskillId}` : 'Навык';
  const mappedTitle = hasSubskillId
    ? (titleById.get(subskillId) ?? fallbackTitle)
    : fallbackTitle;
  const explicitTitle = skill?.title?.trim() ?? '';
  const title = explicitTitle.length > 0 ? explicitTitle : mappedTitle;

  return { title, type };
};

export function ProfileRequests(): ReactElement {
  const { isAuthenticated, accessToken, isInitializing } = useAuth();
  const [incoming, setIncoming] = useState<Request[]>([]);
  const [outgoing, setOutgoing] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillNames, setSkillNames] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    let isMounted = true;
    loadFiltersBaseData().then((data) => {
      if (!isMounted) return;
      setSkillNames(getSubskillNameMap(data.skillGroups));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const loadRequests = useCallback(
    async (token?: string) => {
      const effectiveToken = token ?? accessToken;
      if (!effectiveToken) {
        setIncoming([]);
        setOutgoing([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await requestsApi.fetchAll(effectiveToken);
        setIncoming(data.incoming);
        setOutgoing(data.outgoing);
        setError(null);
      } catch (err) {
        console.error('[ProfileRequests] Failed to load', err);
        setError('Не удалось загрузить заявки. Попробуйте обновить страницу.');
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (accessToken) {
      loadRequests(accessToken);
    } else {
      setIncoming([]);
      setOutgoing([]);
    }
  }, [accessToken, loadRequests]);

  const handleRequestAction = useCallback(
    async (requestId: string, action: 'accept' | 'reject') => {
      if (!accessToken) {
        return;
      }
      try {
        if (action === 'accept') {
          await acceptRequest(accessToken, requestId);
        } else {
          await rejectRequest(accessToken, requestId);
        }
        await loadRequests(accessToken);
      } catch (err) {
        console.error('[ProfileRequests] Failed to update status', err);
        setError(
          'Не удалось обновить статус заявки. Попробуйте повторить позже.'
        );
      }
    },
    [accessToken, loadRequests]
  );

  const renderRequestCard = (request: Request, direction: RequestDirection) => {
    const skillMeta = parseSkillMeta(request.skill, skillNames);
    const statusClass = clsx(
      styles.statusBadge,
      styles[`status-${request.status}`]
    );

    const counterpart =
      direction === 'incoming' ? request.fromUser : request.toUser;
    const counterpartName = counterpart?.name ?? 'Участник';

    return (
      <li key={request.id} className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.skillGroup}>
            <span className={styles.skillType}>
              {SKILL_TYPE_LABEL[skillMeta.type]}
            </span>
            <p className={styles.skillTitle}>{skillMeta.title}</p>
          </div>
          <span className={statusClass}>{STATUS_LABELS[request.status]}</span>
        </div>

        <div className={styles.meta}>
          <span>
            {direction === 'incoming' ? 'Отправитель:' : 'Получатель:'}{' '}
            <strong>{counterpartName}</strong>
          </span>
          <span>
            Создана: <strong>{formatDateTime(request.createdAt)}</strong>
          </span>
          {request.updatedAt && (
            <span>
              Обновлена: <strong>{formatDateTime(request.updatedAt)}</strong>
            </span>
          )}
        </div>

        <p className={styles.note}>{STATUS_HINTS[request.status]}</p>

        {direction === 'incoming' && request.status === 'pending' && (
          <div className={styles.actions}>
            <Button
              variant='primary'
              onClick={() => handleRequestAction(request.id, 'accept')}
            >
              Принять
            </Button>
            <Button
              variant='secondary'
              onClick={() => handleRequestAction(request.id, 'reject')}
            >
              Отклонить
            </Button>
          </div>
        )}

        {direction === 'outgoing' && request.status === 'pending' && (
          <p className={styles.pendingHint}>
            Ожидаем ответ от участника. Можно напомнить ему в чате.
          </p>
        )}
      </li>
    );
  };

  if (isInitializing) {
    return (
      <section className={styles.requests}>
        <Title tag='h2' variant='lg'>
          Заявки на обмен
        </Title>
        <p className={styles.subtitle}>Загружаем ваш профиль…</p>
      </section>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <section className={styles.requests}>
        <Title tag='h2' variant='lg'>
          Войдите, чтобы видеть заявки
        </Title>
        <p className={styles.subtitle}>
          Этот раздел доступен только авторизованным пользователям. Пожалуйста,
          выполните вход или зарегистрируйтесь.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.requests}>
      <div className={styles.header}>
        <div>
          <Title tag='h2' variant='lg'>
            Заявки на обмен
          </Title>
          <p className={styles.subtitle}>
            Следите за входящими откликами и контролируйте заявки, которые вы
            отправили другим участникам.
          </p>
        </div>
        <Button
          variant='secondary'
          onClick={() => loadRequests(accessToken)}
          disabled={isLoading}
        >
          {isLoading ? 'Обновляем…' : 'Обновить'}
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.columns}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <Title tag='h3' variant='md'>
              Входящие
            </Title>
            <span className={styles.counter}>{incoming.length}</span>
          </div>

          {incoming.length ? (
            <ul className={styles.list}>
              {incoming.map((request) =>
                renderRequestCard(request, 'incoming')
              )}
            </ul>
          ) : (
            <p className={styles.empty}>
              Пока никто не оставил откликов. Как только появятся запросы, они
              появятся здесь.
            </p>
          )}
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <Title tag='h3' variant='md'>
              Исходящие
            </Title>
            <span className={styles.counter}>{outgoing.length}</span>
          </div>

          {outgoing.length ? (
            <ul className={styles.list}>
              {outgoing.map((request) =>
                renderRequestCard(request, 'outgoing')
              )}
            </ul>
          ) : (
            <p className={styles.empty}>
              Вы ещё не откликались на навыки других участников. Найдите
              интересный навык в каталоге и оставьте заявку.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
