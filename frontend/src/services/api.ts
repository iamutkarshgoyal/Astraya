import axios from 'axios';

import { readStoredAuth } from '@/services/token-storage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const storedAuth = readStoredAuth();
  if (storedAuth?.access_token) {
    config.headers.Authorization = `Bearer ${storedAuth.access_token}`;
  }
  return config;
});
