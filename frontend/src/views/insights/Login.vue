<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-8">
      <div class="text-center mb-6">
        <i class="fas fa-chart-line text-4xl text-emerald-400"></i>
        <h1 class="text-xl font-bold mt-3 text-white">{{ cfg.name }}</h1>
        <p class="text-sm text-slate-400">Tableau de bord — Ventes & Clients</p>
      </div>
      <form @submit.prevent="submit" class="space-y-4">
        <input v-model="username" placeholder="Utilisateur" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" />
        <input v-model="password" type="password" placeholder="Mot de passe" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" />
        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
        <button :disabled="busy" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold disabled:opacity-50">
          <i v-if="busy" class="fas fa-circle-notch fa-spin mr-2"></i>Entrer
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInsightsAuthStore } from '../../stores/insights';
import { useConfigStore } from '../../stores/config';

const router = useRouter();
const ins = useInsightsAuthStore();
const cfg = useConfigStore();

const username = ref('');
const password = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
  busy.value = true;
  error.value = '';
  try {
    await ins.login(username.value, password.value);
    router.push('/insights');
  } catch {
    error.value = 'Identifiants invalides';
  } finally {
    busy.value = false;
  }
}
</script>
