<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- Nav -->
    <nav class="bamboo-gradient text-white shadow-lg sticky top-0 z-40">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <img :src="cfg.logo" alt="logo" class="w-14 h-14 object-contain" />
            <div>
              <h1 class="text-xl font-bold">{{ cfg.name }}</h1>
              <p class="text-xs opacity-80 hidden sm:block">PUTEAUX-LA DÉFENSE</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button @click="editTable" class="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-sm hover:bg-white/30 transition">
              <i class="fas fa-table text-xs"></i>
              <span class="font-medium">{{ cart.table ? 'T' + cart.table : '---' }}</span>
              <i class="fas fa-pen text-[10px] ml-0.5 opacity-70"></i>
            </button>
            <LanguageSwitcher />
            <button @click="cartOpen = true" class="relative">
              <div class="flex items-center bg-white/20 px-3 py-2 rounded-lg"><i class="fas fa-shopping-cart"></i><span class="ml-2 font-bold">{{ cart.count }}</span></div>
              <div v-if="cart.count" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{{ cart.count > 9 ? '9+' : cart.count }}</div>
            </button>
          </div>
        </div>
        <CategoryTabs v-model="category" :categories="categories" mobile />
      </div>
    </nav>

    <main class="container mx-auto px-4 py-4">
      <!-- Welcome card -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-6" style="background-image: linear-gradient(#f6f9f4 .1em, transparent .1em); background-size: 100% 1.2em;">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-bold bamboo-text mb-1">{{ t('order.welcome') }}</h2>
            <p class="text-gray-600">{{ t('order.specialties') }}</p>
          </div>
          <button @click="openLoyalty" class="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow active:scale-95 transition">
            <div class="flex items-center">
              <i class="fas fa-crown text-yellow-500 mr-2"></i>
              <div class="text-left">
                <p class="text-xs text-gray-500">{{ t('order.myPoints') }}</p>
                <p class="font-bold bamboo-text">{{ member.loggedIn ? member.points : '---' }}</p>
              </div>
            </div>
          </button>
        </div>
        <div class="hidden sm:block mt-6">
          <CategoryTabs v-model="category" :categories="categories" />
        </div>
      </div>

      <div v-if="menu.loading" class="text-center py-20 text-gray-400">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3 bamboo-text"></i>
        <p>{{ t('menu.loading') }}</p>
      </div>
      <div v-else-if="!visible.length" class="text-center py-20 text-gray-400">{{ t('menu.empty') }}</div>
      <OrderMenu v-else :category="category" @add="onAdd" />
    </main>

    <!-- Floating buttons -->
    <div class="fixed bottom-20 right-4 z-30 flex flex-col space-y-2">
      <button @click="scrollTop" class="w-12 h-12 rounded-full bamboo-gradient text-white shadow-lg flex items-center justify-center"><i class="fas fa-arrow-up"></i></button>
      <button @click="infosOpen = true" class="w-12 h-12 rounded-full bg-white border border-bamboo-light text-gray-700 shadow-lg flex items-center justify-center"><i class="fas fa-circle-info"></i></button>
    </div>

    <!-- Bottom bar -->
    <div class="fixed bottom-0 inset-x-0 bg-white border-t shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-30">
      <div class="container mx-auto grid grid-cols-2 h-16 divide-x divide-gray-100">
        <button @click="cartOpen = true" class="relative flex flex-col items-center justify-center active:bg-gray-50">
          <div class="relative">
            <i class="fas fa-shopping-cart text-2xl bamboo-text mb-1"></i>
            <div v-if="cart.count" class="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{{ cart.count }}</div>
          </div>
          <span class="text-sm font-bold bamboo-text">{{ t('order.cart') }}</span>
        </button>
        <button @click="openLoyalty" class="flex flex-col items-center justify-center active:bg-gray-50">
          <i class="fas fa-crown text-2xl text-yellow-500 mb-1"></i>
          <span class="text-sm font-bold text-gray-700">{{ t('loyalty.tab') }}</span>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <CartSidebar v-model:open="cartOpen" @login="openLogin" @sent="onSent" />
    <ComboModal v-if="comboProduct" :product="comboProduct" :entrees="comboEntrees" @close="comboProduct = null" @confirm="onCombo" />
    <LoyaltyModal v-if="loyaltyOpen" @close="loyaltyOpen = false" @logout="logout" />
    <LoginModal v-if="loginOpen" @close="loginOpen = false" @success="loginOpen = false" />
    <InfosModal v-if="infosOpen" @close="infosOpen = false" />

    <!-- Table number modal -->
    <div v-if="tableModalOpen" class="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" @click.self="tableModalOpen = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">
        <div class="bamboo-gradient h-3 w-full"></div>
        <div class="p-6">
          <h3 class="text-lg font-bold bamboo-text mb-1 flex items-center"><i class="fas fa-table mr-2"></i>{{ t('order.table') }}</h3>
          <p class="text-sm text-gray-500 mb-4">{{ t('order.tablePrompt') }}</p>
          <input
            v-model="tableInput"
            type="text"
            inputmode="numeric"
            class="w-full border-2 border-gray-200 rounded-xl p-3 text-lg text-center font-bold focus:border-green-600 outline-none"
            :placeholder="t('order.takeaway')"
            @keyup.enter="saveTable"
          />
          <div class="flex gap-3 mt-5">
            <button @click="tableModalOpen = false" class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold">{{ t('common.cancel') }}</button>
            <button @click="saveTable" class="flex-1 py-3 rounded-xl bamboo-gradient text-white font-bold">{{ t('common.confirm') }}</button>
          </div>
        </div>
      </div>
    </div>
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
import OrderMenu from '../components/order/OrderMenu.vue';
import CartSidebar from '../components/order/CartSidebar.vue';
import ComboModal from '../components/order/ComboModal.vue';
import LoyaltyModal from '../components/order/LoyaltyModal.vue';
import LoginModal from '../components/order/LoginModal.vue';
import InfosModal from '../components/order/InfosModal.vue';

const { t } = useI18n();
const route = useRoute();
const menu = useMenuStore();
const cfg = useConfigStore();
const cart = useCartStore();
const member = useMemberStore();

const category = ref('');
const cartOpen = ref(false);
const loyaltyOpen = ref(false);
const loginOpen = ref(false);
const infosOpen = ref(false);
const comboProduct = ref(null);
const tableModalOpen = ref(false);
const tableInput = ref('');

const categories = computed(() => menu.activeCategories);
const visible = computed(() => menu.byCategory(category.value));
// Entrées for the combo modal are resolved server-side (works even if an
// entrée isn't separately available); fall back to a local lookup just in case.
const comboEntrees = computed(() => {
  const p = comboProduct.value;
  if (!p) return [];
  if (Array.isArray(p.comboEntrees) && p.comboEntrees.length) return p.comboEntrees;
  return menu.products.filter((x) => (p.comboOptions || []).some((id) => String(id) === String(x.id)));
});

watch(categories, (list) => {
  if (!category.value && list.length) category.value = list[0];
});

function onAdd(product) {
  if (product.comboOptions && product.comboOptions.length) comboProduct.value = product;
  else cart.add(product);
}
function onCombo(entree) {
  cart.addCombo(comboProduct.value, entree);
  comboProduct.value = null;
}
function openLoyalty() {
  if (member.loggedIn) loyaltyOpen.value = true;
  else loginOpen.value = true;
}
function openLogin() {
  cartOpen.value = false;
  loginOpen.value = true;
}
function logout() {
  member.logout();
  loyaltyOpen.value = false;
}
function onSent() {
  cartOpen.value = false;
}
function editTable() {
  tableInput.value = cart.table;
  tableModalOpen.value = true;
}
function saveTable() {
  cart.table = tableInput.value.trim();
  tableModalOpen.value = false;
}
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(async () => {
  if (route.query.table) cart.table = String(route.query.table);
  await menu.loadPublic();
  if (member.loggedIn) member.refresh();
});
</script>
