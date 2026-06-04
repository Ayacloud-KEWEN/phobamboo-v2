import { defineStore } from 'pinia';
import api from '../api/client';
import { useConfigStore } from './config';
import { useMemberStore } from './member';

const STORAGE_KEY = 'pb_cart';
export const COMBO_PRICE_ADDITION = 3.8; // "Formule Entrée" supplement (€)

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Cart + checkout. Table number comes from the QR code (?table=) via the router.
export const useCartStore = defineStore('cart', {
  state: () => ({
    table: '',
    items: load(), // [{ id, nameFr,nameEn,nameZh, price, quantity, image, isReward, pointsCost }]
    notes: '',
  }),
  getters: {
    count: (s) => s.items.reduce((n, i) => n + i.quantity, 0),
    total: (s) => Number(s.items.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2)),
    pointsToSpend: (s) => s.items.reduce((n, i) => n + (i.pointsCost || 0) * i.quantity, 0),
    // Loyalty preview: nothing below the daily threshold, else floor(total*rate).
    pointsToEarn() {
      const cfg = useConfigStore();
      if (this.total < (cfg.pointsThreshold ?? 20)) return 0;
      return Math.floor(this.total * (cfg.pointsPerEuro || 1));
    },
    // Quantity of a base dish in the cart (sums combo variants sharing the base id).
    quantityOf: (s) => (baseId) =>
      s.items
        .filter((i) => !i.isReward && (i.id === baseId || i.id.startsWith(baseId + '_')))
        .reduce((n, i) => n + i.quantity, 0),
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    },
    _push(item) {
      const found = this.items.find((i) => i.id === item.id && !i.isReward);
      if (found) found.quantity += item.quantity || 1;
      else this.items.push({ quantity: 1, ...item });
      this.persist();
    },
    add(product) {
      this._push({
        id: product.id,
        nameFr: product.nameFr,
        nameEn: product.nameEn,
        nameZh: product.nameZh,
        price: product.price,
        image: product.image,
        isReward: false,
      });
    },
    // Combo: base dish optionally + an entrée (adds supplement, distinct id).
    addCombo(product, entree) {
      if (!entree) return this.add(product);
      const suffix = ` (+ ${entree.nameFr || entree.nameEn || entree.nameZh})`;
      this._push({
        id: `${product.id}_${entree.id}`,
        nameFr: (product.nameFr || '') + suffix,
        nameEn: (product.nameEn || '') + suffix,
        nameZh: (product.nameZh || '') + suffix,
        price: Number((product.price + COMBO_PRICE_ADDITION).toFixed(2)),
        image: product.image,
        isReward: false,
      });
    },
    addReward(reward) {
      this.items.push({
        id: `reward-${Date.now()}`,
        nameFr: `🎁 ${reward.nameFr || reward.nameEn || reward.nameZh}`,
        nameEn: `🎁 ${reward.nameEn || reward.nameFr || reward.nameZh}`,
        nameZh: `🎁 ${reward.nameZh || reward.nameFr || reward.nameEn}`,
        price: 0,
        quantity: 1,
        image: '/gift.png',
        isReward: true,
        pointsCost: reward.cost,
      });
      this.persist();
    },
    setQuantity(id, qty) {
      const it = this.items.find((i) => i.id === id);
      if (!it) return;
      it.quantity = qty;
      if (it.quantity <= 0) this.remove(id);
      else this.persist();
    },
    remove(id) {
      this.items = this.items.filter((i) => i.id !== id);
      this.persist();
    },
    clear() {
      this.items = [];
      this.notes = '';
      this.persist();
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
      if (member.phone) await member.refresh();
      this.clear();
      return data;
    },
  },
});
