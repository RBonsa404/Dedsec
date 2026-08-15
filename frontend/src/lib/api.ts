import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    return 'http://localhost:4000/api';
  }
  let cleaned = envUrl.trim().replace(/\/+$/, '');
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

