<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <AdminNav />
    <audio ref="alertAudio" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

    <div class="px-4 py-4">
      <!-- Tabs + pending total -->
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div class="flex gap-2">
          <button
            @click="tab = 'orders'"
            class="px-4 py-2 rounded-lg font-bold border transition"
            :class="tab === 'orders' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-400'"
          >
            <i class="fas fa-receipt mr-2"></i>Commandes
          </button>
          <button
            @click="tab = 'members'"
            class="px-4 py-2 rounded-lg font-bold border transition"
            :class="tab === 'members' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-400'"
          >
            <i class="fas fa-users mr-2"></i>Fidélité
          </button>
        </div>
        <div v-if="tab === 'orders'" class="flex items-center gap-3">
          <button
            @click="load"
            class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
            title="Rafraîchir"
          >
            <i class="fas fa-rotate" :class="{ 'fa-spin': loading }"></i>
          </button>
          <button
            @click="toggleSound"
            class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
            :title="soundOn ? 'Son activé' : 'Son coupé'"
          >
            <i :class="soundOn ? 'fas fa-volume-high' : 'fas fa-volume-xmark text-slate-500'"></i>
          </button>
          <div class="text-right">
            <p class="text-xs text-slate-400">En attente</p>
            <p class="text-2xl font-bold text-green-400">{{ pendingTotal.toFixed(2) }}€</p>
          </div>
        </div>
      </div>

      <!-- ===== Orders ===== -->
      <div v-show="tab === 'orders'">
        <div v-if="loading" class="text-center text-slate-500 py-20"><i class="fas fa-circle-notch fa-spin text-3xl"></i></div>
        <div v-else-if="!orders.length" class="text-center text-slate-500 py-20">
          <i class="fas fa-check-circle text-4xl mb-4 text-green-900"></i>
          <p class="text-xl">Tout est encaissé !</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div
            v-for="o in orders"
            :key="o.id"
            class="bg-slate-800 rounded-xl border-2 overflow-hidden flex flex-col transition"
            :class="isLate(o) ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]' : o.status === 'completed' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-slate-700'"
          >
            <div class="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-start">
              <div>
                <span class="text-xs font-bold text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">N°{{ o.dailyNumber || '–' }}</span>
                <div class="mt-1 leading-none">
                  <span v-if="o.table" class="text-5xl font-black">{{ o.table }}</span>
                  <span v-else class="text-xl font-bold text-blue-300"><i class="fas fa-bag-shopping mr-1"></i>À emporter</span>
                </div>
                <div class="text-xs font-mono mt-1.5" :class="isLate(o) ? 'text-red-400 font-bold' : 'text-slate-400'">
                  {{ time(o.createdAt) }} · {{ elapsedMin(o) }} min
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="flex flex-col items-end gap-1.5">
                  <span
                    class="px-2 py-1 rounded text-xs font-bold border flex items-center"
                    :class="o.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'"
                  >
                    <i :class="o.status === 'completed' ? 'fas fa-bell mr-1' : 'fas fa-fire mr-1'"></i>
                    {{ o.status === 'completed' ? 'PRÊT' : 'EN CUISINE' }}
                  </span>
                  <span v-if="o.phone && o.phone.length > 4" class="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                    <i class="fas fa-user mr-1"></i>{{ o.phone }}
                  </span>
                </div>
                <button @click="cancel(o)" class="text-red-500 p-1.5 active:scale-90" title="Annuler"><i class="fas fa-times text-xl"></i></button>
              </div>
            </div>

            <div class="p-4 flex-grow space-y-1 overflow-y-auto max-h-48">
              <div v-for="(i, idx) in o.items" :key="idx" class="flex justify-between text-slate-300 text-sm">
                <span>{{ i.quantity }}× {{ i.name }}</span>
                <span>{{ (i.price * i.quantity).toFixed(2) }}</span>
              </div>
              <div v-if="o.notes" class="mt-2 text-xs text-red-300 bg-red-900/20 p-2 rounded border border-red-900/50">
                <i class="fas fa-info-circle mr-1"></i>{{ o.notes }}
              </div>
            </div>

            <div class="p-4 bg-slate-900 border-t border-slate-700">
              <div class="flex justify-between items-end mb-3">
                <span class="text-slate-400 text-sm">Total</span>
                <span class="text-3xl font-bold">{{ o.total.toFixed(2) }}€</span>
              </div>
              <div class="grid grid-cols-5 gap-2">
                <button
                  @click="printTicket(o)"
                  class="col-span-1 bg-slate-700 hover:bg-slate-600 rounded-lg py-3"
                  title="Imprimer le ticket"
                ><i class="fas fa-print"></i></button>
                <button
                  v-if="o.status === 'pending'"
                  @click="setStatus(o, 'completed')"
                  class="col-span-1 bg-slate-700 hover:bg-slate-600 rounded-lg py-3"
                  title="Marquer prêt"
                ><i class="fas fa-bell"></i></button>
                <button
                  @click="pay(o)"
                  :disabled="o._busy"
                  class="bg-blue-600 hover:bg-blue-500 font-bold rounded-lg py-3 shadow-lg active:scale-95 transition disabled:opacity-50"
                  :class="o.status === 'pending' ? 'col-span-3' : 'col-span-4'"
                >
                  <i class="fas fa-check mr-1"></i>ENCAISSÉ
                  <span v-if="o.phone && o.pointsToEarn" class="text-xs opacity-80">(+{{ o.pointsToEarn }})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Members ===== -->
      <div v-show="tab === 'members'" class="max-w-lg mx-auto">
        <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 class="text-lg font-bold mb-4 text-slate-300 border-b border-slate-700 pb-2">Gestion Client</h2>
          <div class="flex gap-2 mb-6">
            <input
              v-model="searchPhone"
              @keyup.enter="search"
              type="tel"
              placeholder="Numéro (ex: 0612345678)"
              class="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-lg outline-none focus:border-blue-500"
            />
            <button @click="search" class="bg-blue-600 hover:bg-blue-500 px-5 rounded-xl text-xl active:scale-95"><i class="fas fa-search"></i></button>
          </div>

          <div v-if="memberBusy" class="text-center py-4 text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Recherche...</div>

          <div v-else-if="member">
            <div class="bg-slate-700/50 rounded-xl p-6 text-center mb-4 border border-slate-600">
              <p class="text-sm text-slate-400 uppercase tracking-wide mb-1">{{ member.phone }} — Solde</p>
              <div class="text-5xl font-black text-yellow-400">{{ member.points }} <span class="text-xl">pts</span></div>
              <div v-if="memberHistory" class="mt-3 text-xs text-slate-400 flex justify-center gap-4">
                <span><i class="fas fa-store mr-1"></i>{{ memberHistory.visits }} visites</span>
                <span><i class="fas fa-euro-sign mr-1"></i>{{ memberHistory.lifetimeSpend.toFixed(2) }}€ cumulés</span>
              </div>
            </div>

            <!-- Name -->
            <div class="flex gap-2 mb-4">
              <input v-model="nameInput" placeholder="Nom du client (optionnel)" class="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
              <button @click="saveName" class="bg-slate-700 hover:bg-slate-600 px-4 rounded-lg text-sm font-bold">Nom</button>
            </div>

            <h3 class="text-sm font-bold text-slate-400 mb-2">Modification rapide</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <button @click="adjust(100)" class="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-bold border border-slate-600">+100</button>
              <button @click="adjust(200)" class="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-bold border border-slate-600">+200</button>
              <button @click="adjust(-200)" class="bg-red-900/30 hover:bg-red-900/50 text-red-200 p-3 rounded-lg font-bold border border-red-900/50">-200</button>
              <button @click="adjust(-500)" class="bg-red-900/30 hover:bg-red-900/50 text-red-200 p-3 rounded-lg font-bold border border-red-900/50">-500</button>
            </div>
            <div class="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <label class="block text-xs text-slate-500 mb-2 uppercase">Ajustement manuel</label>
              <div class="flex gap-2">
                <input v-model.number="customDelta" type="number" placeholder="+ / -" class="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                <button @click="adjust(customDelta)" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold">VALIDER</button>
              </div>
            </div>

            <!-- Order history -->
            <div v-if="memberHistory && memberHistory.orders.length" class="mt-5">
              <h3 class="text-sm font-bold text-slate-400 mb-2">Dernières commandes</h3>
              <div class="space-y-1 max-h-52 overflow-y-auto">
                <div v-for="h in memberHistory.orders" :key="h.id" class="flex items-center justify-between text-sm bg-slate-900/60 rounded-lg px-3 py-2">
                  <span class="text-slate-400">{{ dayLabel(h.paidAt) }} <span v-if="h.dailyNumber" class="text-slate-600">#{{ h.dailyNumber }}</span></span>
                  <div class="flex items-center gap-3">
                    <span class="font-bold">{{ h.total.toFixed(2) }}€</span>
                    <button @click="refundOrder(h)" class="text-slate-500 hover:text-red-400" title="Rembourser"><i class="fas fa-rotate-left"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-else-if="searched" class="text-center text-slate-500 py-4">Aucun membre trouvé pour ce numéro.</p>
        </div>
      </div>
    </div>

    <!-- Payment method picker -->
    <div v-if="payTarget" class="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4" @click.self="payTarget = null">
      <div class="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-6 text-center">
        <p class="text-slate-400 text-sm">Encaisser</p>
        <p class="text-4xl font-black mb-5">{{ payTarget.total.toFixed(2) }}€</p>
        <div class="grid grid-cols-2 gap-3">
          <button @click="doPay('cash')" class="bg-emerald-600 hover:bg-emerald-500 rounded-xl py-5 font-bold text-lg active:scale-95 transition">
            <i class="fas fa-money-bill-wave block text-2xl mb-1"></i>Espèces
          </button>
          <button @click="doPay('card')" class="bg-blue-600 hover:bg-blue-500 rounded-xl py-5 font-bold text-lg active:scale-95 transition">
            <i class="fas fa-credit-card block text-2xl mb-1"></i>Carte
          </button>
        </div>
        <button @click="payTarget = null" class="mt-4 text-sm text-slate-400 hover:text-white">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import api from '../../api/client';
import { joinRoom, getSocket } from '../../api/socket';
import { toast } from '../../composables/toast';
import { confirmDialog } from '../../composables/confirm';
import { printReceipt } from '../../composables/printReceipt';
import { useConfigStore } from '../../stores/config';
import AdminNav from '../../components/AdminNav.vue';

const cfg = useConfigStore();

const tab = ref('orders');
const orders = ref([]);
const loading = ref(true);

const pendingTotal = computed(() =>
  orders.value.filter((o) => o.status === 'pending').reduce((s, o) => s + o.total, 0)
);

function time(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Ticking clock for order aging (updated every 30s).
const now = ref(Date.now());
let clockTimer = null;
const elapsedMin = (o) => Math.floor((now.value - new Date(o.createdAt).getTime()) / 60000);
const isLate = (o) => o.status === 'pending' && elapsedMin(o) >= 15;

// New-order sound + mute toggle.
const soundOn = ref(true);
const alertAudio = ref(null);
function playSound() {
  if (soundOn.value && alertAudio.value) alertAudio.value.play().catch(() => {});
}
function toggleSound() {
  soundOn.value = !soundOn.value;
  // Unlock audio on this user gesture so later auto-play works.
  if (soundOn.value && alertAudio.value) {
    alertAudio.value.play().then(() => { alertAudio.value.pause(); alertAudio.value.currentTime = 0; }).catch(() => {});
  }
}

function printTicket(o) {
  printReceipt(o, cfg.name);
}

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get('/api/orders', { params: { status: 'pending,completed', today: true } });
    orders.value = data;
  } finally {
    loading.value = false;
  }
}

function upsert(order) {
  const i = orders.value.findIndex((o) => o.id === order.id);
  const active = order.status === 'pending' || order.status === 'completed';
  if (!active) {
    if (i !== -1) orders.value.splice(i, 1);
    return;
  }
  if (i !== -1) orders.value[i] = { ...orders.value[i], ...order };
  else orders.value.unshift(order);
}

// Payment: pick a method (cash/card) before confirming.
const payTarget = ref(null);
function pay(o) {
  payTarget.value = o;
}
async function doPay(method) {
  const o = payTarget.value;
  payTarget.value = null;
  if (!o) return;
  o._busy = true;
  try {
    const { data } = await api.post(`/api/orders/${o.id}/pay`, { method });
    orders.value = orders.value.filter((x) => x.id !== o.id);
    const awarded = data.order?.pointsAwarded || 0;
    if (data.member) toast(`+${awarded} pts → ${data.member.points} pts`, 'success');
    else toast('Encaissé', 'success');
  } catch (e) {
    o._busy = false;
    toast(e?.response?.data?.error || 'Erreur', 'error');
  }
}

async function refundOrder(h) {
  const ok = await confirmDialog({
    title: 'Rembourser',
    message: `Commande #${h.dailyNumber || ''} · ${h.total.toFixed(2)}€\nLes points liés seront annulés.`,
    danger: true,
    confirmText: 'Rembourser',
  });
  if (!ok) return;
  try {
    const { data } = await api.post(`/api/orders/${h.id}/refund`);
    if (data.member) member.value = data.member;
    if (member.value) loadHistory(member.value.phone);
    toast('Remboursé', 'success');
  } catch (e) {
    toast(e?.response?.data?.error || 'Erreur', 'error');
  }
}

async function setStatus(o, status) {
  try {
    const { data } = await api.patch(`/api/orders/${o.id}/status`, { status });
    upsert(data);
  } catch {
    toast('Erreur', 'error');
  }
}

async function cancel(o) {
  const ok = await confirmDialog({ title: 'Annuler la commande', message: 'Cette action est irréversible.', danger: true, confirmText: 'Annuler' });
  if (!ok) return;
  try {
    await api.patch(`/api/orders/${o.id}/status`, { status: 'cancelled' });
    orders.value = orders.value.filter((x) => x.id !== o.id);
  } catch {
    toast('Erreur', 'error');
  }
}

// --- Members ---
const searchPhone = ref('');
const member = ref(null);
const memberBusy = ref(false);
const searched = ref(false);
const customDelta = ref(0);
const memberHistory = ref(null); // { orders, visits, lifetimeSpend }
const nameInput = ref('');

async function search() {
  const phone = searchPhone.value.replace(/\s+/g, '');
  if (!phone) return;
  memberBusy.value = true;
  searched.value = true;
  member.value = null;
  memberHistory.value = null;
  try {
    const { data } = await api.get(`/api/members/${encodeURIComponent(phone)}`);
    member.value = data;
    loadHistory(data.phone);
  } catch {
    member.value = null;
  } finally {
    memberBusy.value = false;
  }
}

async function loadHistory(phone) {
  try {
    const { data } = await api.get(`/api/members/${encodeURIComponent(phone)}/orders`);
    memberHistory.value = data;
    // Full profile (incl. name) comes from this admin endpoint, not the public one.
    nameInput.value = data.member?.name || '';
  } catch {
    memberHistory.value = null;
  }
}

async function saveName() {
  if (!member.value) return;
  try {
    const { data } = await api.patch(`/api/members/${encodeURIComponent(member.value.phone)}`, { name: nameInput.value });
    member.value = { ...member.value, name: data.name };
    toast('Nom enregistré', 'success');
  } catch {
    toast('Erreur', 'error');
  }
}

const dayLabel = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

async function adjust(delta) {
  if (!member.value || !delta) return;
  try {
    const { data } = await api.patch(`/api/members/${encodeURIComponent(member.value.phone)}/points`, { delta });
    member.value = data;
    customDelta.value = 0;
    toast(`Solde: ${data.points} pts`, 'success');
  } catch {
    toast('Erreur', 'error');
  }
}

// --- Realtime ---
let socket = null;
function onNew(o) {
  upsert(o);
  playSound();
  toast(`Nouvelle commande #${o.dailyNumber || ''} ${o.table ? '· ' + o.table : ''}`, 'info');
}
function onUpdate(o) {
  upsert(o);
}
function onMember(m) {
  if (member.value && member.value.phone === m.phone) member.value = m;
}

onMounted(() => {
  load();
  clockTimer = setInterval(() => (now.value = Date.now()), 30000);
  socket = joinRoom('counter');
  socket.on('order:new', onNew);
  socket.on('order:update', onUpdate);
  socket.on('member:update', onMember);
});

onBeforeUnmount(() => {
  clearInterval(clockTimer);
  const s = getSocket();
  s.off('order:new', onNew);
  s.off('order:update', onUpdate);
  s.off('member:update', onMember);
});
</script>
