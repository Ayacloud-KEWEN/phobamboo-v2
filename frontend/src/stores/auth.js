import { defineStore } from 'pinia';
import api from '../api/client';

// Admin (staff/owner) auth for the back-office pages.
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('pb_token') || '',
    admin: null,
  }),
  getters: {
    isAuthed: (s) => !!s.token,
    isOwner: (s) => s.admin?.role === 'owner',
  },
  actions: {
    async login(username, password) {
      const { data } = await api.post('/api/auth/login', { username, password });
      this.token = data.token;
      this.admin = data.admin;
      localStorage.setItem('pb_token', data.token);
      return data.admin;
    },
    async fetchMe() {
      if (!this.token) return null;
      try {
        const { data } = await api.get('/api/auth/me');
        this.admin = data.admin;
        return data.admin;
      } catch {
        this.logout();
        return null;
      }
    },
    logout() {
      this.token = '';
      this.admin = null;
      localStorage.removeItem('pb_token');
    },
  },
});
