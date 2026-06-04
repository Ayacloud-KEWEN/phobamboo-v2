<template>
  <div class="min-h-screen flex flex-col pb-24">
    <!-- Header -->
    <nav class="bamboo-gradient text-white shadow-lg sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <i class="fa-solid fa-bowl-food text-2xl"></i>
            <div>
              <h1 class="text-lg font-bold tracking-wide">{{ cfg.name }}</h1>
              <p class="text-[10px] opacity-90 uppercase tracking-wider">
                {{ cart.table ? `${t('order.table')} ${cart.table}` : t('order.takeaway') }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="loyaltyOpen = true"
              class="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition flex items-center gap-1.5 text-sm font-bold"
            >
              <i class="fas fa-star text-amber-300"></i>
              <span>{{ member.loggedIn ? member.points : '–' }}</span>
            </button>
            <LanguageSwitcher />
          </div>
        </div>
        <CategoryTabs v-model="category" :categories="categories" mobile />
      </div>
    </nav>

    <!-- Menu -->
    <main class="container mx-auto px-4 py-6 flex-1">
      <CategoryTabs v-model="category" :categories="categories" />

      <div v-if="menu.loading" class="text-center py-20 text-gray-400">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3 bamboo-text"></i>
        <p>{{ t('menu.loading') }}</p>
      </div>
      <div v-else-if="!visible.length" class="text-center py-20 text-gray-400">{{ t('menu.empty') }}</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
        <ProductCard v-for="p in visible" :key="p.id" :product="p" orderable @add="cart.add($event)" />
      </div>
    </main>

    <!-- Floating cart bar -->
    <div v-if="cart.count" class="fixed bottom-4 inset-x-0 px-4 z-40">
      <button
        @click="cartOpen = true"
        class="w-full max-w-lg mx-auto bamboo-bg text-white rounded-full shadow-xl px-6 py-4 flex items-center justify-between active:scale-[0.99] transition"
      >
        <span class="flex items-center gap-2 font-bold">
          <i class="fas fa-basket-shopping"></i>
          {{ cart.count }} · {{ t('order.cart') }}
        </span>
        <span class="font-extrabold">{{ cart.total.toFixed(2) }} €</span>
      </button>
    </div>

    <CartDrawer v-model:open="cartOpen" @login="openLogin" @sent="onSent" />
    <LoyaltyModal v-model:open="loyaltyOpen" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMenuStore } from '../stores/menu';
import { useConfigStore } from '../stores/config';
import { useCartStore } from '../stores/cart';
import { useMemberStore } from '../stores/member';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import CategoryTabs from '../components/CategoryTabs.vue';
import ProductCard from '../components/ProductCard.vue';
import CartDrawer from '../components/CartDrawer.vue';
import LoyaltyModal from '../components/LoyaltyModal.vue';

const { t } = useI18n();
const route = useRoute();
const menu = useMenuStore();
const cfg = useConfigStore();
const cart = useCartStore();
const member = useMemberStore();

const category = ref('');
const cartOpen = ref(false);
const loyaltyOpen = ref(false);

const categories = computed(() => menu.activeCategories);
const visible = computed(() => menu.byCategory(category.value));

watch(categories, (list) => {
  if (!category.value && list.length) category.value = list[0];
});

function openLogin() {
  cartOpen.value = false;
  loyaltyOpen.value = true;
}
function onSent() {
  cartOpen.value = false;
}

onMounted(async () => {
  // QR code carries the table number: /order?table=5
  if (route.query.table) cart.table = String(route.query.table);
  await menu.loadPublic();
  if (member.loggedIn) member.refresh();
});
</script>
