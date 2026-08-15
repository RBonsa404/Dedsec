import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    // If running in browser on a production domain (like vercel.app)
    const isHosted = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
    
    // If envUrl is missing or set to localhost on a hosted site, default to the production Render URL
    if (isHosted && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return 'https://dedsec-api.onrender.com/api';
    }
  }

  let cleaned = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : 'http://localhost:4000/api';
  
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  
  // Ensure /api suffix
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }

  // Force HTTPS if hosted on HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && cleaned.startsWith('http://') && !cleaned.includes('localhost')) {
    cleaned = cleaned.replace('http://', 'https://');
  }

  return cleaned;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60s to accommodate Render free tier cold-start
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Dynamically update baseURL if needed in browser
  if (typeof window !== 'undefined') {
    config.baseURL = getApiBaseUrl();
  }
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

