<template>
  <div class="fixed top-4 right-4 z-[100] space-y-2 w-72">
    <transition-group enter-active-class="transition duration-200" enter-from-class="opacity-0 translate-x-4" leave-active-class="transition duration-200" leave-to-class="opacity-0">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="rounded-xl px-4 py-3 shadow-lg text-white text-sm font-semibold flex items-center gap-2"
        :class="{
          'bg-emerald-600': t.type === 'success',
          'bg-red-600': t.type === 'error',
          'bg-slate-700': t.type === 'info',
        }"
      >
        <i :class="`fas ${t.type === 'success' ? 'fa-check-circle' : t.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}`"></i>
        <span>{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { toasts } from '../composables/toast';
</script>
