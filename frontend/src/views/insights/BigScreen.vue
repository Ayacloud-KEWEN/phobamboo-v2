<template>
  <div class="min-h-screen bg-slate-950 text-white p-4 lg:p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <img :src="cfg.logo" alt="logo" class="w-11 h-11 object-contain" />
        <div>
          <h1 class="text-xl lg:text-2xl font-black">{{ cfg.name }}</h1>
          <p class="text-xs text-slate-400">Ventes & Clients</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <div class="text-2xl lg:text-3xl font-mono font-bold tabular-nums">{{ clock }}</div>
          <div class="text-xs text-slate-400">{{ today }}</div>
        </div>
        <button @click="logout" class="text-slate-500 hover:text-red-400" title="Quitter"><i class="fas fa-right-from-bracket text-lg"></i></button>
      </div>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <div class="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5">
        <p class="text-emerald-100 text-sm">Aujourd'hui</p>
        <p class="text-4xl lg:text-5xl font-black mt-1">{{ o.todayRevenue.toFixed(2) }}€</p>
        <p class="text-emerald-100 text-sm mt-1">{{ o.todayOrders }} commandes</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <p class="text-slate-400 text-sm"><i class="fas fa-euro-sign mr-1 text-blue-400"></i>CA total</p>
        <p class="text-3xl lg:text-4xl font-black mt-1">{{ o.revenue.toFixed(2) }}€</p>
        <p class="text-slate-500 text-sm mt-1">{{ o.paidOrderCount }} commandes payées</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <p class="text-slate-400 text-sm"><i class="fas fa-users mr-1 text-purple-400"></i>Clients fidélité</p>
        <p class="text-3xl lg:text-4xl font-black mt-1">{{ o.memberCount }}</p>
        <p class="text-slate-500 text-sm mt-1">{{ o.totalPoints }} points en circulation</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <p class="text-slate-400 text-sm"><i class="fas fa-wallet mr-1 text-amber-400"></i>Paiements</p>
        <p class="text-xl font-bold mt-2"><i class="fas fa-money-bill-wave text-emerald-400 mr-1"></i>{{ o.cashRevenue.toFixed(2) }}€</p>
        <p class="text-xl font-bold mt-1"><i class="fas fa-credit-card text-blue-400 mr-1"></i>{{ o.cardRevenue.toFixed(2) }}€</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <!-- Daily revenue -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 class="font-bold text-slate-300 mb-4"><i class="fas fa-chart-column mr-2 text-blue-400"></i>Revenu — 14 derniers jours</h2>
        <div v-if="!daily.length" class="text-slate-500 text-center py-12">Aucune donnée.</div>
        <div v-else class="flex items-end gap-1.5 h-44">
          <div v-for="d in daily" :key="d.date" class="flex-1 flex flex-col items-center justify-end group">
            <div class="w-full bg-emerald-500 group-hover:bg-emerald-400 rounded-t transition-all" :style="{ height: `${Math.max(4, (d.revenue / maxRev) * 100)}%` }" :title="`${d.date}: ${d.revenue}€`"></div>
            <span class="text-[9px] text-slate-500 mt-1">{{ d.date.slice(8) }}</span>
          </div>
        </div>
      </div>

      <!-- Top dishes -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 class="font-bold text-slate-300 mb-4"><i class="fas fa-fire mr-2 text-orange-400"></i>Plats les plus vendus</h2>
        <table class="w-full text-sm">
          <tbody>
            <tr v-for="(p, i) in topProducts" :key="p.name" class="border-b border-slate-800/70">
              <td class="py-2 text-slate-500 w-6">{{ i + 1 }}</td>
              <td class="truncate max-w-[240px]">{{ p.name }}</td>
              <td class="text-right font-bold whitespace-nowrap">×{{ p.qty }}</td>
              <td class="text-right text-emerald-400 whitespace-nowrap pl-3">{{ p.revenue.toFixed(0) }}€</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!topProducts.length" class="text-slate-500 text-center py-6">—</p>
      </div>

      <!-- Top customers -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 class="font-bold text-slate-300 mb-4"><i class="fas fa-crown mr-2 text-yellow-400"></i>Meilleurs clients</h2>
        <table class="w-full text-sm">
          <thead class="text-slate-500 text-left border-b border-slate-800">
            <tr><th class="py-1">Client</th><th class="text-right">Visites</th><th class="text-right">Dépensé</th><th class="text-right">Points</th></tr>
          </thead>
          <tbody>
            <tr v-for="m in topMembers" :key="m.phone" class="border-b border-slate-800/70">
              <td class="py-2"><div class="font-semibold">{{ m.name || 'Client' }}</div><div class="text-xs text-slate-500 font-mono">{{ m.phone }}</div></td>
              <td class="text-right">{{ m.visits }}</td>
              <td class="text-right font-bold text-emerald-400">{{ m.spend.toFixed(0) }}€</td>
              <td class="text-right text-yellow-400">{{ m.points }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!topMembers.length" class="text-slate-500 text-center py-6">—</p>
      </div>

      <!-- Recent orders -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 class="font-bold text-slate-300 mb-4"><i class="fas fa-receipt mr-2 text-blue-400"></i>Dernières ventes</h2>
        <div class="space-y-1.5">
          <div v-for="r in recent" :key="r.id" class="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2 text-sm">
            <span class="text-slate-400">{{ timeOf(r.paidAt) }} · {{ r.table ? 'T' + r.table : '🛍' }} <span class="text-slate-600">#{{ r.dailyNumber }}</span></span>
            <span class="flex items-center gap-2">
              <i v-if="r.paymentMethod === 'cash'" class="fas fa-money-bill-wave text-emerald-400"></i>
              <i v-else-if="r.paymentMethod === 'card'" class="fas fa-credit-card text-blue-400"></i>
              <span class="font-bold">{{ r.total.toFixed(2) }}€</span>
            </span>
          </div>
        </div>
        <p v-if="!recent.length" class="text-slate-500 text-center py-6">—</p>
      </div>
    </div>

    <p class="text-center text-slate-600 text-xs mt-5">Mise à jour automatique · dernière : {{ lastUpdate }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import iapi from '../../api/insightsClient';
import { useInsightsAuthStore } from '../../stores/insights';
import { useConfigStore } from '../../stores/config';

const router = useRouter();
const ins = useInsightsAuthStore();
const cfg = useConfigStore();

const o = ref({ todayRevenue: 0, todayOrders: 0, revenue: 0, paidOrderCount: 0, memberCount: 0, totalPoints: 0, cashRevenue: 0, cardRevenue: 0 });
const daily = ref([]);
const topProducts = ref([]);
const topMembers = ref([]);
const recent = ref([]);
const clock = ref('');
const lastUpdate = ref('—');

const maxRev = computed(() => Math.max(1, ...daily.value.map((d) => d.revenue)));
const today = computed(() => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
const timeOf = (iso) => (iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '');

async function loadAll() {
  try {
    const [ov, dl, tp, tm, rc] = await Promise.all([
      iapi.get('/api/insights/overview'),
      iapi.get('/api/insights/daily', { params: { days: 14 } }),
      iapi.get('/api/insights/top-products', { params: { days: 30 } }),
      iapi.get('/api/insights/top-members'),
      iapi.get('/api/insights/recent-orders'),
    ]);
    o.value = ov.data;
    daily.value = dl.data;
    topProducts.value = tp.data;
    topMembers.value = tm.data;
    recent.value = rc.data;
    lastUpdate.value = new Date().toLocaleTimeString('fr-FR');
  } catch (e) {
    if (e?.response?.status === 401 || e?.response?.status === 403) logout();
  }
}

function tickClock() {
  clock.value = new Date().toLocaleTimeString('fr-FR');
}
function logout() {
  ins.logout();
  router.push('/insights/login');
}

let dataTimer = null;
let clockTimer = null;
onMounted(() => {
  tickClock();
  clockTimer = setInterval(tickClock, 1000);
  loadAll();
  dataTimer = setInterval(loadAll, 60000); // refresh every minute
});
onBeforeUnmount(() => {
  clearInterval(dataTimer);
  clearInterval(clockTimer);
});
</script>
