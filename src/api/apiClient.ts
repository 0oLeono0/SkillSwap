import axios from 'axios';

const envApiUrl = import.meta?.env?.VITE_API_URL as string | undefined;
const API_BASE_URL = envApiUrl ?? 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
