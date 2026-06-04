import { defineStore } from 'pinia';
import api from '../api/client';

export const CATEGORY_ORDER = ['menus', 'plats', 'entrees', 'boissons', 'alcool', 'desserts'];

export const useMenuStore = defineStore('menu', {
  state: () => ({
    products: [],
    rewards: [],
    loading: false,
    error: false,
  }),
  getters: {
    // Categories that actually have products, in the canonical order.
    activeCategories(state) {
      const present = new Set(state.products.map((p) => p.category));
      return CATEGORY_ORDER.filter((c) => present.has(c));
    },
    byCategory: (state) => (cat) => state.products.filter((p) => p.category === cat),
  },
  actions: {
    async loadPublic() {
      this.loading = true;
      this.error = false;
      try {
        const [prods, rewards] = await Promise.all([
          api.get('/api/products', { params: { available: true } }),
          api.get('/api/rewards', { params: { active: true } }),
        ]);
        this.products = prods.data;
        this.rewards = rewards.data;
      } catch (e) {
        this.error = true;
        console.error('Menu load error', e);
      } finally {
        this.loading = false;
      }
    },
  },
});
