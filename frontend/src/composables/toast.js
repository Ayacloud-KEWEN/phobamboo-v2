import { reactive } from 'vue';

// Minimal shared toast state for admin pages.
export const toasts = reactive([]);

let seq = 0;
export function toast(message, type = 'info', ms = 3000) {
  const id = ++seq;
  toasts.push({ id, message, type });
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id);
    if (i !== -1) toasts.splice(i, 1);
  }, ms);
}
