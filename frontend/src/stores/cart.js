import { defineStore } from 'pinia';
import api from '../api/client';
import { useConfigStore } from './config';
import { useMemberStore } from './member';

const STORAGE_KEY = 'pb_cart';

function load() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    // Drop items saved by an older version (missing productId/rewardId) so the
    // new id-based checkout never sends invalid lines.
    return items.filter((i) => (i.isReward ? i.rewardId : i.productId));
  } catch {
    return [];
  }
}

// Cart + checkout. Display fields (names/price/image) are local convenience only;
// at checkout we send product/reward IDs and the SERVER recomputes all amounts.
export const useCartStore = defineStore('cart', {
  state: () => ({
    table: '',
    items: load(), // { id, productId|rewardId, comboEntreeId?, nameFr/En/Zh, price, quantity, image, isReward, pointsCost }
    notes: '',
  }),
  getters: {
    count: (s) => s.items.reduce((n, i) => n + i.quantity, 0),
    total: (s) => Number(s.items.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2)),
    pointsToSpend: (s) => s.items.reduce((n, i) => n + (i.pointsCost || 0) * i.quantity, 0),
    pointsToEarn() {
      const cfg = useConfigStore();
      if (this.total < (cfg.pointsThreshold ?? 20)) return 0;
      return Math.floor(this.total * (cfg.pointsPerEuro || 1));
    },
    // Quantity of a base dish (sums its combo variants too).
    quantityOf: (s) => (productId) =>
      s.items.filter((i) => !i.isReward && i.productId === productId).reduce((n, i) => n + i.quantity, 0),
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
        productId: product.id,
        nameFr: product.nameFr,
        nameEn: product.nameEn,
        nameZh: product.nameZh,
        price: product.price,
        image: product.image,
        isReward: false,
      });
    },
    addCombo(product, entree) {
      if (!entree) return this.add(product);
      const cfg = useConfigStore();
      const suffix = ` (+ ${entree.nameFr || entree.nameEn || entree.nameZh})`;
      this._push({
        id: `${product.id}_${entree.id}`,
        productId: product.id,
        comboEntreeId: entree.id,
        nameFr: (product.nameFr || '') + suffix,
        nameEn: (product.nameEn || '') + suffix,
        nameZh: (product.nameZh || '') + suffix,
        price: Number((product.price + (cfg.comboPrice ?? 3.8)).toFixed(2)),
        image: product.image,
        isReward: false,
      });
    },
    addReward(reward) {
      this.items.push({
        id: `reward-${Date.now()}`,
        rewardId: reward.id,
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
      // Send only ids + quantities — the server prices everything.
      const lines = this.items.map((i) =>
        i.isReward
          ? { kind: 'reward', rewardId: i.rewardId, quantity: i.quantity }
          : { kind: 'product', productId: i.productId, comboEntreeId: i.comboEntreeId || null, quantity: i.quantity }
      );
      const { data } = await api.post('/api/orders', {
        table: this.table,
        phone: member.phone || '',
        notes: this.notes,
        lines,
      });
      if (member.phone) await member.refresh();
      this.clear();
      return data;
    },
  },
});
