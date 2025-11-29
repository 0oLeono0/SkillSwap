const rawApiUrl = (import.meta?.env?.VITE_API_URL as string | undefined)?.trim();
const fallbackApiUrl = 'http://localhost:4000/api';

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

// Централизованная точка для базового URL API без лишних слэшей на конце
export const apiBaseUrl = normalizeBaseUrl(rawApiUrl && rawApiUrl.length > 0 ? rawApiUrl : fallbackApiUrl);
