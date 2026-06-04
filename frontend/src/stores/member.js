import { defineStore } from 'pinia';
import api from '../api/client';

// Customer-side loyalty membership (phone login, no password).
export const useMemberStore = defineStore('member', {
  state: () => ({
    phone: localStorage.getItem('pb_phone') || '',
    points: 0,
  }),
  getters: {
    loggedIn: (s) => !!s.phone,
  },
  actions: {
    async login(phone, acceptsSMS = false) {
      const clean = String(phone).replace(/\s+/g, '');
      const { data } = await api.post('/api/members', { phone: clean, acceptsSMS });
      this.phone = data.phone;
      this.points = data.points;
      localStorage.setItem('pb_phone', this.phone);
      return data;
    },
    async refresh() {
      if (!this.phone) return;
      try {
        const { data } = await api.get(`/api/members/${encodeURIComponent(this.phone)}`);
        this.points = data.points;
      } catch {
        /* member not found yet — keep 0 */
      }
    },
    logout() {
      this.phone = '';
      this.points = 0;
      localStorage.removeItem('pb_phone');
    },
  },
});
