import axios from 'axios';

const API_BASE_URL =
  // Vite at runtime
  (import.meta?.env?.VITE_API_URL as string | undefined) ??
  // Jest/Node fallback
  process.env?.VITE_API_URL ??
  'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
