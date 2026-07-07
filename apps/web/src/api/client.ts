import axios from 'axios';
import { useAppStore } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10s timeout — prevent hung requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach Bearer token ──
apiClient.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Auto-logout on 401 ──
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session and redirect to login
      useAppStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
