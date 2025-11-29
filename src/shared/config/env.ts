const rawApiUrl = (import.meta?.env?.VITE_API_URL as string | undefined)?.trim();
const fallbackApiUrl =
  typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/api`
    : 'http://localhost:4000/api';

// Централизованная точка для базового URL API
export const apiBaseUrl = rawApiUrl && rawApiUrl.length > 0 ? rawApiUrl : fallbackApiUrl;
