import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    const isHosted = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
    
    // If envUrl is missing or points to localhost on a hosted site, use the production Render URL
    if (isHosted && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return 'https://dedsec-api.onrender.com/api';
    }
  }

  let cleaned = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : 'http://localhost:4000/api';
  
  cleaned = cleaned.replace(/\/+$/, '');
  
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && cleaned.startsWith('http://') && !cleaned.includes('localhost')) {
    cleaned = cleaned.replace('http://', 'https://');
  }

  return cleaned;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token reliably from memory or localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.baseURL = getApiBaseUrl();
  }

  let token = useAuthStore.getState().accessToken;

  // Fallback to localStorage directly if Zustand is still hydrating
  if (!token && typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('dedsec_token') || null;
      if (!token) {
        const persisted = localStorage.getItem('dedsec-auth');
        if (persisted) {
          const parsed = JSON.parse(persisted);
          token = parsed.state?.accessToken || null;
        }
      }
    } catch (_) {}
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: only redirect on genuine 401 when token was sent and rejected
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const isAuthPage = 
        window.location.pathname.includes('/login') || 
        window.location.pathname.includes('/forgot-password') || 
        window.location.pathname.includes('/reset-password');

      if (error.response?.status === 401 && !isAuthPage) {
        // Only wipe auth if the user was supposedly logged in
        const hadToken = !!useAuthStore.getState().accessToken || !!localStorage.getItem('dedsec_token');
        if (hadToken) {
          localStorage.removeItem('dedsec_token');
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
