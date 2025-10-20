import type { Request, RequestStatus } from '../types';

const STORAGE_KEY = 'requests';

/**
 * Получение всех заявок из localStorage
 */
export function getRequests(): Request[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[getRequests] Ошибка парсинга localStorage:', error);
    return [];
  }
}

/**
 * Сохранение списка заявок в localStorage
 */
export function saveRequests(requests: Request[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error('[saveRequests] Ошибка сохранения:', error);
  }
}

/**
 * Добавление новой заявки
 */
export function addRequest(request: Request) {
  const current = getRequests();

  const isDuplicate = current.some(r => r.id === request.id);
  if (isDuplicate) return;

  saveRequests([...current, request]);
}

/**
 * Обновление статуса заявки
 */
export function updateRequestStatus(id: string, status: RequestStatus) {
  const current = getRequests();
  const updated = current.map(r =>
    r.id === id
      ? { ...r, status, updatedAt: new Date().toISOString() }
      : r
  );
  saveRequests(updated);
}
