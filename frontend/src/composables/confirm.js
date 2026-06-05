import { reactive } from 'vue';

// Shared styled confirm dialog. Usage:
//   if (await confirmDialog({ title, message, danger: true })) { ... }
export const confirmState = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  danger: false,
  _resolve: null,
});

export function confirmDialog(opts = {}) {
  return new Promise((resolve) => {
    confirmState.title = opts.title || '';
    confirmState.message = opts.message || '';
    confirmState.confirmText = opts.confirmText || '';
    confirmState.cancelText = opts.cancelText || '';
    confirmState.danger = !!opts.danger;
    confirmState._resolve = resolve;
    confirmState.open = true;
  });
}

export function settleConfirm(value) {
  confirmState.open = false;
  const r = confirmState._resolve;
  confirmState._resolve = null;
  if (r) r(value);
}
