import { defineStore } from 'pinia';
import iapi from '../api/insightsClient';

// Auth for the standalone sales/customer big-screen (separate from admin).
export const useInsightsAuthStore = defineStore('insightsAuth', {
  state: () => ({
    token: localStorage.getItem('pb_itoken') || '',
    user: null,
  }),
  getters: {
    isAuthed: (s) => !!s.token,
  },
  actions: {
    async login(username, password) {
      const { data } = await iapi.post('/api/insights/login', { username, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('pb_itoken', data.token);
      return data.user;
    },
    async fetchMe() {
      if (!this.token) return null;
      try {
        const { data } = await iapi.get('/api/insights/me');
        this.user = data.user;
        return data.user;
      } catch {
        this.logout();
        return null;
      }
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('pb_itoken');
    },
  },
});
