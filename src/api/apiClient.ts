import axios from 'axios';
import { apiBaseUrl } from '@/shared/config/env';

const API_BASE_URL = apiBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
