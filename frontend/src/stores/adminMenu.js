import { defineStore } from 'pinia';
import api from '../api/client';

// Back-office menu management: full product/reward lists (including unavailable).
export const useAdminMenuStore = defineStore('adminMenu', {
  state: () => ({
    products: [],
    rewards: [],
    loading: false,
  }),
  getters: {
    // Entrées are selectable as combo options for "menus" products.
    entrees: (s) => s.products.filter((p) => p.category === 'entrees'),
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        const [p, r] = await Promise.all([api.get('/api/products'), api.get('/api/rewards')]);
        this.products = p.data;
        this.rewards = r.data;
      } finally {
        this.loading = false;
      }
    },
    async saveProduct(payload) {
      if (payload.id) await api.put(`/api/products/${payload.id}`, payload);
      else await api.post('/api/products', payload);
      await this.load();
    },
    async toggleAvailability(p) {
      await api.patch(`/api/products/${p.id}/availability`, { available: !p.available });
      p.available = !p.available;
    },
    async deleteProduct(id) {
      await api.delete(`/api/products/${id}`);
      await this.load();
    },
    async saveReward(payload) {
      if (payload.id) await api.put(`/api/rewards/${payload.id}`, payload);
      else await api.post('/api/rewards', payload);
      await this.load();
    },
    async deleteReward(id) {
      await api.delete(`/api/rewards/${id}`);
      await this.load();
    },
  },
});
