<template>
  <div class="min-h-screen bg-gray-900 text-white p-2 flex flex-col">
    <audio ref="alert" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

    <!-- Header -->
    <div class="w-full flex justify-between items-center mb-4 px-2 py-2 border-b border-gray-800">
      <h1 class="text-xl font-bold flex items-center">
        <i class="fas fa-fire text-orange-500 mr-2"></i>CUISINE (KDS)
      </h1>
      <div class="flex items-center gap-3">
        <div class="flex items-center bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          <div class="w-2 h-2 rounded-full mr-2" :class="connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></div>
          <span class="text-xs text-gray-400">{{ connected ? 'Live' : 'Hors ligne' }}</span>
        </div>
        <button @click="toggleSound" class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded border border-gray-600" :title="soundOn ? 'Son activé' : 'Son coupé'">
          <i :class="soundOn ? 'fas fa-volume-high' : 'fas fa-volume-xmark'"></i>
        </button>
        <router-link to="/admin/counter" class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded border border-gray-600 text-sm">
          <i class="fas fa-cash-register"></i>
        </router-link>
      </div>
    </div>

    <!-- Orders -->
    <div v-if="!orders.length" class="flex-1 flex items-center justify-center text-gray-600 text-xl font-mono">
      EN ATTENTE DE COMMANDES...
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
      <div
        v-for="(o, index) in orders"
        :key="o.id"
        class="flex flex-col justify-between bg-gray-900 border-2 rounded-xl overflow-hidden min-h-[300px]"
        :class="index === 0 ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-gray-700'"
      >
        <div class="flex justify-between items-center p-3 border-b border-gray-700" :class="index === 0 ? 'bg-green-900/30' : 'bg-gray-800'">
          <div class="flex items-center">
            <span class="text-3xl font-black" :class="o.table ? 'text-white' : 'text-blue-400'">
              <i v-if="!o.table" class="fas fa-bag-shopping"></i>
              <template v-else>{{ o.table }}</template>
            </span>
            <span v-if="index === 0" class="ml-3 bg-green-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">NOUVEAU</span>
          </div>
          <span class="text-xl font-mono text-gray-400">{{ time(o.createdAt) }}</span>
        </div>

        <div class="p-4 flex-grow overflow-y-auto space-y-2">
          <div v-for="(i, idx) in o.items" :key="idx" class="flex items-start text-lg">
            <span class="text-yellow-400 mr-2 min-w-[30px] text-right font-bold">{{ i.quantity }}×</span>
            <span class="text-gray-100 font-bold">{{ i.name }}</span>
          </div>
          <div v-if="o.notes" class="mt-4 bg-red-900/40 border-l-4 border-red-500 p-2 text-red-200 font-bold text-lg">
            <i class="fas fa-exclamation-triangle mr-2"></i>{{ o.notes }}
          </div>
        </div>

        <div class="p-3 border-t border-gray-700 bg-gray-800/50">
          <button
            @click="complete(o)"
            :disabled="o._busy"
            class="w-full bg-green-700 hover:bg-green-600 text-white text-2xl font-bold py-4 rounded-lg shadow-lg active:scale-95 transition flex items-center justify-center disabled:opacity-50"
          >
            <i class="fas fa-check-circle mr-3"></i>TERMINÉ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import api from '../../api/client';
import { joinRoom, getSocket } from '../../api/socket';

const orders = ref([]);
const connected = ref(false);
const soundOn = ref(true);
const alert = ref(null);

function time(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function toggleSound() {
  soundOn.value = !soundOn.value;
  // Unlock audio on user gesture so later programmatic play() works.
  if (soundOn.value && alert.value) {
    alert.value.play().then(() => { alert.value.pause(); alert.value.currentTime = 0; }).catch(() => {});
  }
}

function playSound() {
  if (soundOn.value && alert.value) alert.value.play().catch(() => {});
}

async function load() {
  // KDS only cares about today's pending (not-yet-cooked) orders, newest first.
  const { data } = await api.get('/api/orders', { params: { status: 'pending', today: true } });
  orders.value = data;
}

async function complete(o) {
  o._busy = true;
  try {
    await api.patch(`/api/orders/${o.id}/status`, { status: 'completed' });
    orders.value = orders.value.filter((x) => x.id !== o.id);
  } catch {
    o._busy = false;
  }
}

// --- Realtime ---
let socket = null;
function onNew(o) {
  if (o.status !== 'pending') return;
  if (orders.value.some((x) => x.id === o.id)) return;
  orders.value.unshift(o);
  playSound();
}
function onUpdate(o) {
  // Once cooked/paid/cancelled elsewhere, drop it from the kitchen board.
  if (o.status !== 'pending') orders.value = orders.value.filter((x) => x.id !== o.id);
}

onMounted(() => {
  load();
  socket = joinRoom('kds');
  connected.value = socket.connected;
  socket.on('connect', () => (connected.value = true));
  socket.on('disconnect', () => (connected.value = false));
  socket.on('order:new', onNew);
  socket.on('order:update', onUpdate);
});

onBeforeUnmount(() => {
  const s = getSocket();
  s.off('order:new', onNew);
  s.off('order:update', onUpdate);
});
</script>
