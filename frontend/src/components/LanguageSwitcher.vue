<template>
  <div class="relative" ref="root">
    <button
      @click="open = !open"
      class="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full transition backdrop-blur-sm border border-white/10"
    >
      <span class="text-lg leading-none">{{ current.flag }}</span>
      <i class="fas fa-chevron-down text-[10px] opacity-80"></i>
    </button>

    <transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50"
      >
        <button
          v-for="l in LOCALES"
          :key="l.code"
          @click="choose(l.code)"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition"
          :class="{ 'bg-bamboo-accent/30 font-semibold': l.code === locale }"
        >
          <span class="text-lg">{{ l.flag }}</span>
          <span class="text-sm">{{ l.label }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { LOCALES, setLocale } from '../i18n';

const { locale } = useI18n();
const open = ref(false);
const root = ref(null);

const current = computed(() => LOCALES.find((l) => l.code === locale.value) || LOCALES[0]);

function choose(code) {
  setLocale(code);
  open.value = false;
}

// Close on outside click.
function onClick(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false;
}
onMounted(() => document.addEventListener('click', onClick));
onBeforeUnmount(() => document.removeEventListener('click', onClick));
</script>
