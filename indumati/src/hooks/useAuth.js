import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(async (payload) => {
    try {
      const response = await api.post('/auth/login', payload);
      setAuth(response.data);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  }, [navigate, setAuth]);

  const register = useCallback(async (payload) => {
    try {
      await api.post('/auth/register', payload);
      toast.success('Registration completed');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  }, [navigate]);

  return { login, register, logout };
}
