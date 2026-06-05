<template>
  <div class="min-h-screen bg-gray-100">
    <AdminNav />

    <div class="max-w-5xl mx-auto px-4 py-5">
      <!-- Controls -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h1 class="text-lg font-bold text-gray-800 mb-4"><i class="fas fa-qrcode mr-2 bamboo-text"></i>QR codes des tables</h1>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
          <label class="block">
            <span class="text-xs font-semibold text-gray-500">De la table</span>
            <input v-model.number="from" type="number" min="1" class="w-full mt-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-bamboo-secondary" />
          </label>
          <label class="block">
            <span class="text-xs font-semibold text-gray-500">À la table</span>
            <input v-model.number="to" type="number" min="1" class="w-full mt-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-bamboo-secondary" />
          </label>
          <label class="block col-span-2">
            <span class="text-xs font-semibold text-gray-500">URL du site</span>
            <input v-model="base" class="w-full mt-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-bamboo-secondary" />
          </label>
        </div>

        <label class="flex items-center gap-2 mt-3 text-sm text-gray-600">
          <input type="checkbox" v-model="includeTakeaway" /> Ajouter un QR « à emporter » (sans numéro)
        </label>

        <div class="flex flex-wrap gap-3 mt-4">
          <button @click="generate" :disabled="busy" class="bamboo-bg text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50">
            <i :class="busy ? 'fas fa-circle-notch fa-spin' : 'fas fa-wand-magic-sparkles'" class="mr-2"></i>Générer
          </button>
          <button v-if="codes.length" @click="printAll" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold">
            <i class="fas fa-print mr-2"></i>Imprimer tout
          </button>
        </div>
        <p v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</p>
      </div>

      <!-- Preview grid -->
      <div v-if="codes.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="c in codes" :key="c.label" class="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
          <img :src="c.dataUrl" :alt="c.label" class="w-full max-w-[180px]" />
          <p class="mt-2 font-bold text-gray-800">{{ c.label }}</p>
          <a :href="c.dataUrl" :download="`qr-${c.file}.png`" class="text-xs text-bamboo-secondary mt-1 hover:underline">
            <i class="fas fa-download mr-1"></i>PNG
          </a>
        </div>
      </div>
      <p v-else class="text-center text-gray-400 py-12">Choisissez une plage de tables puis « Générer ».</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QRCode from 'qrcode';
import { useConfigStore } from '../../stores/config';
import AdminNav from '../../components/AdminNav.vue';

const cfg = useConfigStore();

const from = ref(1);
const to = ref(10);
const base = ref(window.location.origin);
const includeTakeaway = ref(false);
const codes = ref([]);
const busy = ref(false);
const error = ref('');

function orderUrl(table) {
  const root = base.value.replace(/\/+$/, '');
  return table === null ? `${root}/order` : `${root}/order?table=${encodeURIComponent(table)}`;
}

async function generate() {
  error.value = '';
  const a = Math.max(1, Math.floor(from.value || 1));
  const b = Math.max(a, Math.floor(to.value || a));
  if (b - a > 200) {
    error.value = 'Plage trop grande (max 200 tables).';
    return;
  }
  busy.value = true;
  try {
    const out = [];
    for (let n = a; n <= b; n++) {
      const dataUrl = await QRCode.toDataURL(orderUrl(n), { width: 600, margin: 1 });
      out.push({ label: `Table ${n}`, file: `table-${n}`, dataUrl });
    }
    if (includeTakeaway.value) {
      const dataUrl = await QRCode.toDataURL(orderUrl(null), { width: 600, margin: 1 });
      out.push({ label: 'À emporter', file: 'emporter', dataUrl });
    }
    codes.value = out;
  } catch (e) {
    error.value = 'Erreur de génération.';
  } finally {
    busy.value = false;
  }
}

function printAll() {
  const cards = codes.value
    .map(
      (c) => `<div style="display:inline-flex;flex-direction:column;align-items:center;width:260px;margin:14px;padding:16px;border:1px solid #ddd;border-radius:12px;page-break-inside:avoid;">
        <div style="font-size:18px;font-weight:bold;color:#2d5a27;margin-bottom:6px;">${cfg.name}</div>
        <img src="${c.dataUrl}" style="width:220px;height:220px;" />
        <div style="font-size:22px;font-weight:bold;margin-top:8px;">${c.label}</div>
        <div style="font-size:12px;color:#666;margin-top:4px;">Scannez pour commander</div>
      </div>`
    )
    .join('');
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<html><head><title>QR Tables</title></head><body style="text-align:center;font-family:Arial,sans-serif;">${cards}</body></html>`);
  doc.close();
  frame.contentWindow.focus();
  setTimeout(() => {
    frame.contentWindow.print();
    setTimeout(() => document.body.removeChild(frame), 1000);
  }, 300);
}
</script>
