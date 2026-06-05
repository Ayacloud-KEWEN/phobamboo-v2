<template>
  <header class="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
    <div class="px-4 py-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <i class="fa-solid fa-bowl-food text-2xl text-blue-400"></i>
        <h1 class="text-lg font-bold text-white truncate">{{ cfg.name }}</h1>
      </div>

      <nav class="flex items-center gap-1.5">
        <router-link
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="px-3 py-2 rounded-lg text-sm font-semibold border transition flex items-center gap-2"
          :class="isActive(l.to) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'"
        >
          <i :class="`fas ${l.icon}`"></i>
          <span class="hidden sm:inline">{{ l.label }}</span>
        </router-link>
        <button @click="logout" class="ml-1 px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-300">
          <i class="fas fa-right-from-bracket"></i>
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useConfigStore } from '../stores/config';
import { applyAdminManifest } from '../composables/useAdminPwa';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const cfg = useConfigStore();

// Make "Add to Home Screen" from any back-office page open the Comptoir.
onMounted(applyAdminManifest);

const links = computed(() => {
  const base = [
    { to: '/admin/counter', icon: 'fa-cash-register', label: 'Comptoir' },
    { to: '/admin/dashboard', icon: 'fa-chart-line', label: 'Stats' },
    { to: '/admin/menu', icon: 'fa-list', label: 'Menu' },
    { to: '/admin/qrcodes', icon: 'fa-qrcode', label: 'QR' },
  ];
  if (cfg.kdsEnabled) base.push({ to: '/admin/kds', icon: 'fa-kitchen-set', label: 'Cuisine' });
  return base;
});

const isActive = (to) => route.path === to;

function logout() {
  auth.logout();
  router.push('/admin/login');
}
</script>
