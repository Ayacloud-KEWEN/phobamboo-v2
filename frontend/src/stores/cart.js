import { defineStore } from 'pinia';
import api from '../api/client';
import { useConfigStore } from './config';
import { useMemberStore } from './member';

// Cart + checkout. Table number comes from the QR code (?table=) via the router.
export const useCartStore = defineStore('cart', {
  state: () => ({
    table: '',
    items: [], // [{ id, nameFr, nameEn, nameZh, price, quantity }]
    notes: '',
    pointsToSpend: 0,
  }),
  getters: {
    count: (s) => s.items.reduce((n, i) => n + i.quantity, 0),
    total: (s) => Number(s.items.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2)),
    pointsToEarn() {
      const cfg = useConfigStore();
      return Math.round(this.total * (cfg.pointsPerEuro || 0));
    },
  },
  actions: {
    add(product) {
      const found = this.items.find((i) => i.id === product.id);
      if (found) found.quantity += 1;
      else
        this.items.push({
          id: product.id,
          nameFr: product.nameFr,
          nameEn: product.nameEn,
          nameZh: product.nameZh,
          price: product.price,
          quantity: 1,
        });
    },
    setQuantity(id, qty) {
      const it = this.items.find((i) => i.id === id);
      if (!it) return;
      it.quantity = qty;
      if (it.quantity <= 0) this.remove(id);
    },
    remove(id) {
      this.items = this.items.filter((i) => i.id !== id);
    },
    clear() {
      this.items = [];
      this.notes = '';
      this.pointsToSpend = 0;
    },
    async submit() {
      const member = useMemberStore();
      const payload = {
        table: this.table,
        phone: member.phone || '',
        items: this.items.map((i) => ({
          name: i.nameFr || i.nameEn || i.nameZh,
          quantity: i.quantity,
          price: i.price,
        })),
        total: this.total,
        notes: this.notes,
        pointsToEarn: member.phone ? this.pointsToEarn : 0,
        pointsSpent: member.phone ? this.pointsToSpend : 0,
      };
      const { data } = await api.post('/api/orders', payload);
      // Refresh member points if they spent any.
      if (member.phone) await member.refresh();
      this.clear();
      return data;
    },
  },
});
