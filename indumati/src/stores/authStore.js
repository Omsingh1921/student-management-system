import { create } from 'zustand';

const initialUser = JSON.parse(localStorage.getItem('cms_user') || 'null');
const initialToken = localStorage.getItem('cms_token') || '';

export const useAuthStore = create((set) => ({
  token: initialToken,
  user: initialUser,

  setAuth: (auth) => {
    const token = auth.token || auth.accessToken || auth.jwtToken || '';
    const email = auth.email || auth.user?.email || '';
    const role  = auth.role  || auth.user?.role  || '';
    const id    = auth.id    || auth.user?.id    || auth.userId || '';

    localStorage.setItem('cms_token', token);
    localStorage.setItem('cms_user', JSON.stringify({ email, role, id }));
    set({ token, user: { email, role, id } });
  },

  logout: () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    set({ token: '', user: null });
  }
}));
