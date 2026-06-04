<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <AdminNav />
    <div class="px-4 py-5 max-w-6xl mx-auto">
      <div v-if="loading" class="text-center text-slate-500 py-20"><i class="fas fa-circle-notch fa-spin text-3xl"></i></div>
      <template v-else>
        <!-- Summary cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="fa-euro-sign" color="text-green-400" label="Chiffre d'affaires" :value="`${summary.revenue.toFixed(2)}€`" />
          <StatCard icon="fa-receipt" color="text-blue-400" label="Commandes payées" :value="summary.paidOrderCount" />
          <StatCard icon="fa-users" color="text-purple-400" label="Membres" :value="summary.memberCount" />
          <StatCard icon="fa-star" color="text-yellow-400" label="Points en circulation" :value="summary.totalPoints" />
        </div>

        <!-- Daily revenue -->
        <div class="bg-slate-800 rounded-2xl border border-slate-700 p-5 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-slate-300"><i class="fas fa-chart-column mr-2 text-blue-400"></i>Revenu — {{ rangeDays }} derniers jours</h2>
            <select v-model.number="rangeDays" @change="loadDaily" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm">
              <option :value="7">7 j</option>
              <option :value="14">14 j</option>
              <option :value="30">30 j</option>
            </select>
          </div>
          <div v-if="!daily.length" class="text-slate-500 text-center py-10">Aucune donnée.</div>
          <div v-else class="flex items-end gap-1 h-48">
            <div v-for="d in daily" :key="d.date" class="flex-1 flex flex-col items-center justify-end group">
              <div
                class="w-full bg-blue-600 group-hover:bg-blue-400 rounded-t transition-all"
                :style="{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }"
                :title="`${d.date}: ${d.revenue.toFixed(2)}€ (${d.count})`"
              ></div>
              <span class="text-[9px] text-slate-500 mt-1 rotate-45 origin-left whitespace-nowrap">{{ d.date.slice(5) }}</span>
            </div>
          </div>
        </div>

        <!-- Top members -->
        <div class="bg-slate-800 rounded-2xl border border-slate-700 p-5">
          <h2 class="font-bold text-slate-300 mb-4"><i class="fas fa-crown mr-2 text-yellow-400"></i>Top membres</h2>
          <div v-if="!members.length" class="text-slate-500 text-center py-6">Aucun membre.</div>
          <table v-else class="w-full text-sm">
            <thead class="text-slate-500 text-left border-b border-slate-700">
              <tr><th class="py-2">#</th><th>Téléphone</th><th class="text-right">Points</th></tr>
            </thead>
            <tbody>
              <tr v-for="(m, i) in members" :key="m.phone" class="border-b border-slate-700/50">
                <td class="py-2 text-slate-500">{{ i + 1 }}</td>
                <td class="font-mono">{{ m.phone }}</td>
                <td class="text-right font-bold text-yellow-400">{{ m.points }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Owner-only settings (KDS toggle, points rule) -->
        <SettingsPanel v-if="auth.isOwner" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import { useAuthStore } from '../../stores/auth';
import AdminNav from '../../components/AdminNav.vue';
import StatCard from '../../components/StatCard.vue';
import SettingsPanel from '../../components/admin/SettingsPanel.vue';

const auth = useAuthStore();

const loading = ref(true);
const summary = ref({ revenue: 0, paidOrderCount: 0, memberCount: 0, totalPoints: 0 });
const daily = ref([]);
const members = ref([]);
const rangeDays = ref(14);

const maxRevenue = computed(() => Math.max(1, ...daily.value.map((d) => d.revenue)));

async function loadDaily() {
  const { data } = await api.get('/api/stats/daily', { params: { days: rangeDays.value } });
  daily.value = data;
}

onMounted(async () => {
  try {
    const [s, m] = await Promise.all([
      api.get('/api/stats/summary'),
      api.get('/api/members'),
    ]);
    summary.value = s.data;
    members.value = m.data.slice(0, 15);
    await loadDaily();
  } finally {
    loading.value = false;
  }
});
</script>
