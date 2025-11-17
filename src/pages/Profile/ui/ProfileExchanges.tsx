import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import clsx from 'clsx';
import styles from './profileExchanges.module.scss';
import { Title } from '@/shared/ui/Title';
import { Button } from '@/shared/ui/button/Button';
import { useAuth } from '@/app/providers/auth';
import { exchangesApi } from '@/shared/api/exchanges';
import type {
  Exchange,
  ExchangeMessage,
  ExchangeStatus,
  ExchangeWithMessages,
} from '@/entities/Exchange/types';
import { getSubskillNameMap } from '@/entities/Skill/mappers';

interface SkillMeta {
  title: string;
}

const STATUS_LABELS: Record<ExchangeStatus, string> = {
  active: 'Активен',
  completed: 'Завершён',
};

const STATUS_HINTS: Record<ExchangeStatus, string> = {
  active: 'Обмен подтверждён обеими сторонами, можно общаться и назначать созвон.',
  completed: 'Сессия завершена. История переписки сохранена и доступна для просмотра.',
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
    minute: '2-digit',
  });
};

const parseSkillMeta = (skillId: string, titleById: Map<number, string>): SkillMeta => {
  const parts = skillId.split('-');
  if (parts.length < 3) {
    return { title: 'Навык' };
  }

  parts.shift(); // remove user id
  parts.shift(); // remove skill direction
  const subskillIdRaw = parts.shift();
  const subskillId = Number(subskillIdRaw);
  const fallbackTitle = Number.isFinite(subskillId) ? `Навык #${subskillId}` : 'Навык';
  const title = Number.isFinite(subskillId) ? titleById.get(subskillId) ?? fallbackTitle : fallbackTitle;

  return { title };
};

const getRoleLabel = (isInitiator: boolean) =>
  isInitiator ? 'Вы прокачиваете навык' : 'Вы делитесь опытом';

export function ProfileExchanges(): ReactElement {
  const { isAuthenticated, accessToken, isInitializing, user } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeWithMessages | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const skillNames = useMemo(() => getSubskillNameMap(), []);

  const loadExchanges = useCallback(
    async (token?: string) => {
      const effectiveToken = token ?? accessToken;
      if (!effectiveToken) {
        setExchanges([]);
        return;
      }
      setIsListLoading(true);
      try {
        const data = await exchangesApi.fetchAll(effectiveToken);
        const sorted = [...data.exchanges].sort(
          (a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime(),
        );
        setExchanges(sorted);
        setListError(null);
      } catch (err) {
        console.error('[ProfileExchanges] Failed to load exchanges', err);
        setListError('Не удалось загрузить подтверждённые обмены. Попробуйте обновить вкладку позднее.');
      } finally {
        setIsListLoading(false);
      }
    },
    [accessToken],
  );

  const loadExchangeDetails = useCallback(
    async (exchangeId: string, token?: string) => {
      const effectiveToken = token ?? accessToken;
      if (!effectiveToken) {
        setSelectedExchange(null);
        return;
      }
      setIsDetailsLoading(true);
      try {
        const data = await exchangesApi.fetchById(effectiveToken, exchangeId);
        setSelectedExchange(data.exchange);
        setDetailsError(null);
      } catch (err) {
        console.error('[ProfileExchanges] Failed to load exchange details', err);
        setDetailsError('Не удалось загрузить детали обмена.');
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (accessToken) {
      loadExchanges(accessToken);
    } else {
      setExchanges([]);
      setSelectedExchange(null);
      setSelectedExchangeId(null);
    }
  }, [accessToken, loadExchanges]);

  useEffect(() => {
    if (!selectedExchangeId || !accessToken) {
      setSelectedExchange(null);
      return;
    }
    loadExchangeDetails(selectedExchangeId, accessToken);
  }, [accessToken, selectedExchangeId, loadExchangeDetails]);

  useEffect(() => {
    if (!exchanges.length) {
      setSelectedExchangeId(null);
      return;
    }

    setSelectedExchangeId((currentId) => {
      if (currentId && exchanges.some((exchange) => exchange.id === currentId)) {
        return currentId;
      }
      return exchanges[0]?.id ?? null;
    });
  }, [exchanges]);

  const handleSelectExchange = useCallback((exchangeId: string) => {
    setSelectedExchangeId(exchangeId);
    setChatError(null);
    setMessageDraft('');
  }, []);

  const handleDraftChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessageDraft(event.target.value);
  };

  const handleSendMessage = useCallback(async () => {
    if (!selectedExchange || !accessToken) {
      return;
    }
    const text = messageDraft.trim();
    if (!text || selectedExchange.status === 'completed') {
      return;
    }

    setIsSendingMessage(true);
    try {
      const { message } = await exchangesApi.sendMessage(accessToken, selectedExchange.id, text);
      setSelectedExchange((current) =>
        current
          ? {
              ...current,
              messages: [...current.messages, message],
            }
          : current,
      );
      setMessageDraft('');
      setChatError(null);
    } catch (err) {
      console.error('[ProfileExchanges] Failed to send message', err);
      setChatError('Не удалось отправить сообщение. Попробуйте ещё раз.');
    } finally {
      setIsSendingMessage(false);
    }
  }, [accessToken, messageDraft, selectedExchange]);

  const handleCompleteExchange = useCallback(async () => {
    if (!selectedExchange || !accessToken || selectedExchange.status === 'completed') {
      return;
    }

    setIsCompleting(true);
    try {
      const { exchange } = await exchangesApi.complete(accessToken, selectedExchange.id);
      setSelectedExchange((current) =>
        current
          ? {
              ...current,
              status: exchange.status as ExchangeStatus,
              completedAt: exchange.completedAt,
            }
          : current,
      );
      await loadExchanges(accessToken);
    } catch (err) {
      console.error('[ProfileExchanges] Failed to complete exchange', err);
      setDetailsError('Не удалось завершить обмен. Попробуйте ещё раз.');
    } finally {
      setIsCompleting(false);
    }
  }, [accessToken, loadExchanges, selectedExchange]);

  const renderMessage = (message: ExchangeMessage) => {
    const isOwn = message.senderId === user?.id;
    return (
      <li
        key={message.id}
        className={clsx(styles.message, isOwn ? styles.messageOwn : styles.messagePeer)}
      >
        <div className={styles.messageMeta}>
          <span className={styles.messageAuthor}>{message.sender?.name ?? 'Участник'}</span>
          <span className={styles.messageTime}>{formatDateTime(message.createdAt)}</span>
        </div>
        <p className={styles.messageBody}>{message.content}</p>
      </li>
    );
  };

  const selectedSkillMeta = selectedExchange
    ? parseSkillMeta(selectedExchange.request.skillId, skillNames)
    : null;

  if (isInitializing) {
    return (
      <section className={styles.exchanges}>
        <Title tag='h2' variant='lg'>
          Мои обмены
        </Title>
        <p className={styles.subtitle}>Загружаем информацию…</p>
      </section>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <section className={styles.exchanges}>
        <Title tag='h2' variant='lg'>
          Мои обмены
        </Title>
        <p className={styles.subtitle}>
          Авторизуйтесь, чтобы видеть подтверждённые обмены, историю переписки и завершать сессии.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.exchanges}>
      <div className={styles.header}>
        <div>
          <Title tag='h2' variant='lg'>
            Мои обмены
          </Title>
          <p className={styles.subtitle}>
            Здесь хранятся все обмены, подтверждённые обеими сторонами. Выберите карточку, чтобы
            открыть чат и завершить сессию при необходимости.
          </p>
        </div>
        <Button
          variant='secondary'
          onClick={() => loadExchanges(accessToken)}
          disabled={isListLoading}
        >
          {isListLoading ? 'Обновляем…' : 'Обновить'}
        </Button>
      </div>

      {listError && <p className={styles.error}>{listError}</p>}

      <div className={styles.layout}>
        <div className={styles.listWrapper}>
          {exchanges.length ? (
            <ul className={styles.list}>
              {exchanges.map((exchange) => {
                const skillMeta = parseSkillMeta(exchange.request.skillId, skillNames);
                const statusClass = clsx(
                  styles.statusBadge,
                  styles[`status-${exchange.status}`],
                );
                const isActive = exchange.id === selectedExchangeId;
                const counterpart =
                  exchange.initiator.id === user?.id ? exchange.recipient : exchange.initiator;
                const roleLabel = getRoleLabel(exchange.initiator.id === user?.id);
                return (
                  <li key={exchange.id}>
                    <button
                      type='button'
                      className={clsx(styles.listItem, isActive && styles.listItemActive)}
                      onClick={() => handleSelectExchange(exchange.id)}
                    >
                      <div className={styles.listItemHeader}>
                        <div className={styles.skillGroup}>
                          <span className={styles.skillType}>{roleLabel}</span>
                          <p className={styles.skillTitle}>{skillMeta.title}</p>
                        </div>
                        <span className={statusClass}>{STATUS_LABELS[exchange.status]}</span>
                      </div>
                      <div className={styles.listMeta}>
                        <span>
                          Партнёр: <strong>{counterpart?.name ?? 'Участник'}</strong>
                        </span>
                        <span>
                          Подтверждён: <strong>{formatDateTime(exchange.confirmedAt)}</strong>
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.empty}>
              Здесь появятся обмены после того, как обе стороны подтвердят участие. Пока вы ещё не
              подтвердили ни одной заявки или ждёте ответа от партнёров.
            </p>
          )}
        </div>

        <div className={styles.details}>
          {isDetailsLoading && (
            <div className={styles.detailsPlaceholder}>
              <p>Загружаем детали обмена…</p>
            </div>
          )}

          {!isDetailsLoading && !selectedExchange && (
            <div className={styles.detailsPlaceholder}>
              <p>Выберите обмен из списка слева, чтобы увидеть чат и статус.</p>
            </div>
          )}

          {!isDetailsLoading && selectedExchange && selectedSkillMeta && (
            <>
              <header className={styles.detailsHeader}>
                <div>
                  <p className={styles.detailsEyebrow}>
                    {getRoleLabel(selectedExchange.initiator.id === user?.id)}
                  </p>
                  <h3 className={styles.detailsTitle}>{selectedSkillMeta.title}</h3>
                  <p className={styles.detailsMeta}>
                    Подтверждён: {formatDateTime(selectedExchange.confirmedAt)}
                    {selectedExchange.completedAt && (
                      <>
                        {' · '}Завершён: {formatDateTime(selectedExchange.completedAt)}
                      </>
                    )}
                  </p>
                </div>
                <div className={styles.detailsStatus}>
                  <span
                    className={clsx(
                      styles.statusBadge,
                      styles[`status-${selectedExchange.status}`],
                    )}
                  >
                    {STATUS_LABELS[selectedExchange.status]}
                  </span>
                  <Button
                    variant='primary'
                    onClick={handleCompleteExchange}
                    disabled={
                      selectedExchange.status === 'completed' || isCompleting || !selectedExchangeId
                    }
                  >
                    {selectedExchange.status === 'completed'
                      ? 'Сессия завершена'
                      : isCompleting
                        ? 'Завершаем…'
                        : 'Завершить'}
                  </Button>
                </div>
              </header>

              <p className={styles.detailsHint}>{STATUS_HINTS[selectedExchange.status]}</p>

              {detailsError && <p className={styles.error}>{detailsError}</p>}

              <div className={styles.chat}>
                <ul className={styles.messages}>
                  {selectedExchange.messages.length ? (
                    selectedExchange.messages.map(renderMessage)
                  ) : (
                    <li className={styles.messagesEmpty}>Переписка пока пустая.</li>
                  )}
                </ul>

                <div className={styles.chatInput}>
                  <textarea
                    value={messageDraft}
                    onChange={handleDraftChange}
                    placeholder={
                      selectedExchange.status === 'completed'
                        ? 'Обмен завершён, отправка сообщений недоступна'
                        : 'Напишите сообщение партнёру…'
                    }
                    disabled={
                      selectedExchange.status === 'completed' || isSendingMessage || !selectedExchangeId
                    }
                  />
                  <div className={styles.chatActions}>
                    <Button
                      variant='primary'
                      onClick={handleSendMessage}
                      disabled={
                        selectedExchange.status === 'completed' ||
                        isSendingMessage ||
                        messageDraft.trim().length === 0
                      }
                    >
                      {isSendingMessage ? 'Отправляем…' : 'Отправить'}
                    </Button>
                    {chatError && <p className={styles.error}>{chatError}</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
