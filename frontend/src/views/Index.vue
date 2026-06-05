<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <nav class="bamboo-gradient text-white shadow-lg sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2 min-w-0 cursor-pointer" @click="scrollTop">
            <img :src="cfg.logo" alt="logo" class="w-10 h-10 sm:w-14 sm:h-14 object-contain flex-shrink-0" />
            <div class="min-w-0">
              <h1 class="text-xl font-bold tracking-wide">{{ cfg.name }}</h1>
              <p class="text-[10px] opacity-90 uppercase tracking-wider">Puteaux - La Défense</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button @click="onPrint" class="bg-green-800/40 hover:bg-green-800/60 text-white px-3 py-2 rounded-full transition items-center backdrop-blur-sm border border-white/10 hidden sm:flex">
              <i class="fas fa-print mr-2 text-sm"></i><span class="text-sm font-bold">{{ t('nav.pdf') }}</span>
            </button>
            <a href="#infos" class="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full transition items-center backdrop-blur-sm border border-white/10 hidden sm:flex">
              <i class="fas fa-circle-info mr-2 text-sm"></i><span class="text-sm font-bold">{{ t('nav.infos') }}</span>
            </a>
            <a href="tel:0760736465" class="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition flex items-center backdrop-blur-sm border border-white/10">
              <i class="fas fa-phone text-sm sm:mr-2"></i><span class="text-sm font-bold hidden sm:inline">{{ t('nav.reserve') }}</span>
            </a>
            <LanguageSwitcher />
          </div>
        </div>
        <CategoryTabs v-model="category" :categories="categories" mobile />
      </div>
    </nav>

    <!-- Menu -->
    <main class="container mx-auto px-4 py-6 flex-1">
      <div class="text-center mb-8 fade-in">
        <h2 class="text-3xl font-bold bamboo-text mb-2">{{ t('menu.title') }}</h2>
        <p class="text-gray-500 max-w-lg mx-auto">{{ t('menu.subtitle') }}</p>
      </div>

      <div class="mb-8"><CategoryTabs v-model="category" :categories="categories" /></div>

      <div v-if="menu.loading" class="text-center py-20 text-gray-400">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3 bamboo-text"></i>
        <p>{{ t('menu.loading') }}</p>
      </div>
      <div v-else-if="menu.error" class="text-center py-20 text-red-500">{{ t('menu.error') }}</div>
      <div v-else-if="!visible.length" class="text-center py-20 text-gray-400">{{ t('menu.empty') }}</div>
      <MenuItems v-else :category="category" class="pb-10" />
    </main>

    <CustomerFooter />

    <!-- Scroll to top -->
    <transition enter-active-class="transition" enter-from-class="opacity-0 translate-y-4" leave-active-class="transition" leave-to-class="opacity-0">
      <button
        v-show="showTop"
        @click="scrollTop"
        class="fixed bottom-6 right-6 w-12 h-12 rounded-full bamboo-gradient text-white shadow-lg flex items-center justify-center z-40"
      >
        <i class="fas fa-arrow-up"></i>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMenuStore } from '../stores/menu';
import { useConfigStore } from '../stores/config';
import { printMenu } from '../composables/printMenu';
import { applyDefaultManifest } from '../composables/useAdminPwa';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import CategoryTabs from '../components/CategoryTabs.vue';
import MenuItems from '../components/MenuItems.vue';
import CustomerFooter from '../components/CustomerFooter.vue';

const { t } = useI18n();
const menu = useMenuStore();
const cfg = useConfigStore();

const category = ref('');
const showTop = ref(false);
const categories = computed(() => menu.activeCategories);
const visible = computed(() => menu.byCategory(category.value));

watch(categories, (list) => {
  if (!category.value && list.length) category.value = list[0];
});

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function onPrint() {
  printMenu(menu.products, cfg.name);
}
function onScroll() {
  showTop.value = window.scrollY > 300;
}

onMounted(async () => {
  applyDefaultManifest(); // keep home icon → home page
  window.addEventListener('scroll', onScroll);
  await menu.loadPublic();
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>
