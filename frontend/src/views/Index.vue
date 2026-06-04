<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <nav class="bamboo-gradient text-white shadow-lg sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3 cursor-pointer" @click="scrollTop">
            <i class="fa-solid fa-bowl-food text-2xl"></i>
            <div>
              <h1 class="text-xl font-bold tracking-wide">{{ cfg.name }}</h1>
              <p class="text-[10px] opacity-90 uppercase tracking-wider">Puteaux - La Défense</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
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

      <CategoryTabs v-model="category" :categories="categories" />

      <div v-if="menu.loading" class="text-center py-20 text-gray-400">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3 bamboo-text"></i>
        <p>{{ t('menu.loading') }}</p>
      </div>
      <div v-else-if="menu.error" class="text-center py-20 text-red-500">{{ t('menu.error') }}</div>
      <div v-else-if="!visible.length" class="text-center py-20 text-gray-400">{{ t('menu.empty') }}</div>
      <MenuItems v-else :category="category" class="pb-10" />
    </main>

    <CustomerFooter />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMenuStore } from '../stores/menu';
import { useConfigStore } from '../stores/config';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import CategoryTabs from '../components/CategoryTabs.vue';
import MenuItems from '../components/MenuItems.vue';
import CustomerFooter from '../components/CustomerFooter.vue';

const { t } = useI18n();
const menu = useMenuStore();
const cfg = useConfigStore();

const category = ref('');
const categories = computed(() => menu.activeCategories);
const visible = computed(() => menu.byCategory(category.value));

watch(categories, (list) => {
  if (!category.value && list.length) category.value = list[0];
});

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(async () => {
  await menu.loadPublic();
});
</script>
