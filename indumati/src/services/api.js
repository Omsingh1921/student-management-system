import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Prefer token from auth store (avoids repeated localStorage access); fallback to localStorage
    const token = useAuthStore.getState()?.token || localStorage.getItem('cms_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401 = token expired or invalid → force logout
    if (status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = '/login';
    }

    // 403 = role not permitted — stay on page, caller handles it
    return Promise.reject(error);
  }
);

export default api;
