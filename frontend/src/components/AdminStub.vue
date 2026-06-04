<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
    <i :class="`fa-solid ${icon}`" class="text-5xl bamboo-text mb-4"></i>
    <h1 class="text-2xl font-bold text-gray-700">{{ title }}</h1>
    <p class="text-gray-400 mt-2 max-w-sm">{{ subtitle }}</p>
    <button @click="auth.logout" class="mt-6 text-sm text-gray-400 underline">Déconnexion</button>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
defineProps({ title: String, icon: String, subtitle: String });
const auth = useAuthStore();
</script>
