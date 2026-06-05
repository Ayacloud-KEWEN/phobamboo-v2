<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
      <div class="text-center mb-6">
        <i class="fa-solid fa-bowl-food text-4xl bamboo-text"></i>
        <h1 class="text-xl font-bold mt-2">{{ cfg.name }}</h1>
        <p class="text-sm text-gray-400">Administration</p>
      </div>
      <form @submit.prevent="submit" class="space-y-4">
        <input v-model="username" placeholder="Utilisateur" class="w-full border rounded-xl p-3 focus:ring-2 focus:ring-bamboo-secondary outline-none" />
        <input v-model="password" type="password" placeholder="Mot de passe" class="w-full border rounded-xl p-3 focus:ring-2 focus:ring-bamboo-secondary outline-none" />
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <button :disabled="busy" class="w-full bamboo-bg text-white py-3 rounded-xl font-bold disabled:opacity-50">
          <i v-if="busy" class="fas fa-circle-notch fa-spin mr-2"></i>Connexion
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useConfigStore } from '../../stores/config';
import { applyAdminManifest } from '../../composables/useAdminPwa';

onMounted(applyAdminManifest);

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const cfg = useConfigStore();

const username = ref('');
const password = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
  busy.value = true;
  error.value = '';
  try {
    await auth.login(username.value, password.value);
    router.push(route.query.redirect || '/admin/counter');
  } catch {
    error.value = 'Identifiants invalides';
  } finally {
    busy.value = false;
  }
}
</script>
