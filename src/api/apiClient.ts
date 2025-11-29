import axios from 'axios';

const envApiUrl = import.meta?.env?.VITE_API_URL as string | undefined;
const defaultBaseUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:4000/api';
const API_BASE_URL = envApiUrl ?? defaultBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
