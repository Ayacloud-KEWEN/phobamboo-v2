<template>
  <div class="min-h-screen bg-gray-100">
    <AdminNav />

    <div class="max-w-5xl mx-auto px-4 py-5">
      <!-- Tabs -->
      <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div class="flex gap-2">
          <button @click="tab = 'products'" class="px-4 py-2 rounded-lg font-bold border transition" :class="tab === 'products' ? 'bamboo-bg text-white border-transparent' : 'bg-white text-gray-500 border-gray-200'">
            <i class="fas fa-utensils mr-2"></i>Plats
          </button>
          <button @click="tab = 'rewards'" class="px-4 py-2 rounded-lg font-bold border transition" :class="tab === 'rewards' ? 'bamboo-bg text-white border-transparent' : 'bg-white text-gray-500 border-gray-200'">
            <i class="fas fa-gift mr-2"></i>Récompenses
          </button>
        </div>
        <button @click="tab === 'products' ? openProduct() : openReward()" class="bamboo-bg text-white px-4 py-2 rounded-lg font-bold shadow">
          <i class="fas fa-plus mr-2"></i>Ajouter
        </button>
      </div>

      <div v-if="store.loading" class="text-center text-gray-400 py-20"><i class="fas fa-circle-notch fa-spin text-3xl"></i></div>

      <!-- Products -->
      <template v-else-if="tab === 'products'">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
          <button @click="filter = ''" class="px-3 py-1.5 rounded-full text-sm whitespace-nowrap" :class="filter === '' ? 'bamboo-bg text-white' : 'bg-white text-gray-500'">Tous</button>
          <button v-for="c in categories" :key="c" @click="filter = c" class="px-3 py-1.5 rounded-full text-sm whitespace-nowrap" :class="filter === c ? 'bamboo-bg text-white' : 'bg-white text-gray-500'">{{ c }}</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="p in filteredProducts" :key="p.id" class="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm" :class="{ 'opacity-50': !p.available }">
            <div class="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img v-if="p.image" :src="p.image" class="w-full h-full object-cover" />
              <i v-else class="fas fa-bowl-food text-gray-300"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-800 truncate">{{ p.nameFr || p.nameEn || p.nameZh }}</p>
              <p class="text-sm text-gray-400">{{ p.category }} · {{ p.price.toFixed(2) }}€</p>
              <div class="flex gap-1 mt-1">
                <span v-if="p.popular" class="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded">★</span>
                <span v-if="p.spicy" class="text-[10px] bg-red-100 text-red-700 px-1.5 rounded">🌶</span>
                <span v-if="p.vegan" class="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded">🌱</span>
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <button @click="store.toggleAvailability(p)" :title="p.available ? 'Disponible' : 'Masqué'" class="w-10 h-6 rounded-full transition relative" :class="p.available ? 'bamboo-bg' : 'bg-gray-300'">
                <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" :class="p.available ? 'left-[18px]' : 'left-0.5'"></span>
              </button>
              <div class="flex items-center gap-3">
                <button @click="openProduct(p)" class="text-gray-400 hover:text-gray-700" title="Modifier"><i class="fas fa-pen"></i></button>
                <button @click="deleteRow(p)" class="text-gray-300 hover:text-red-500" title="Supprimer"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
        <p v-if="!filteredProducts.length" class="text-center text-gray-400 py-10">Aucun plat.</p>
      </template>

      <!-- Rewards -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="r in store.rewards" :key="r.id" class="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm" :class="{ 'opacity-50': !r.active }">
            <div>
              <p class="font-bold text-gray-800">{{ r.nameFr || r.nameEn || r.nameZh }}</p>
              <p class="text-sm text-amber-600 font-bold"><i class="fas fa-star mr-1"></i>{{ r.cost }} pts</p>
            </div>
            <button @click="openReward(r)" class="text-gray-400 hover:text-gray-700"><i class="fas fa-pen"></i></button>
          </div>
        </div>
        <p v-if="!store.rewards.length" class="text-center text-gray-400 py-10">Aucune récompense.</p>
      </template>
    </div>

    <ProductModal
      v-if="productModal"
      :product="editing"
      :entrees="store.entrees"
      @close="productModal = false"
      @save="onSaveProduct"
      @delete="onDeleteProduct"
    />
    <RewardModal
      v-if="rewardModal"
      :reward="editing"
      @close="rewardModal = false"
      @save="onSaveReward"
      @delete="onDeleteReward"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminMenuStore } from '../../stores/adminMenu';
import { CATEGORY_ORDER } from '../../stores/menu';
import { toast } from '../../composables/toast';
import { confirmDialog } from '../../composables/confirm';
import AdminNav from '../../components/AdminNav.vue';
import ProductModal from '../../components/admin/ProductModal.vue';
import RewardModal from '../../components/admin/RewardModal.vue';

const store = useAdminMenuStore();
const tab = ref('products');
const filter = ref('');
const categories = CATEGORY_ORDER;

const productModal = ref(false);
const rewardModal = ref(false);
const editing = ref(null);

const filteredProducts = computed(() =>
  filter.value ? store.products.filter((p) => p.category === filter.value) : store.products
);

function openProduct(p = null) {
  editing.value = p;
  productModal.value = true;
}
function openReward(r = null) {
  editing.value = r;
  rewardModal.value = true;
}

async function onSaveProduct(payload) {
  try {
    await store.saveProduct(payload);
    productModal.value = false;
    toast('Enregistré', 'success');
  } catch {
    toast('Erreur', 'error');
  }
}
async function onDeleteProduct(id) {
  const ok = await confirmDialog({ title: 'Supprimer le plat', message: 'Cette action est irréversible.', danger: true, confirmText: 'Supprimer' });
  if (!ok) return;
  await store.deleteProduct(id);
  productModal.value = false;
  toast('Supprimé', 'success');
}
async function deleteRow(p) {
  const label = p.nameFr || p.nameEn || p.nameZh || 'ce plat';
  const ok = await confirmDialog({ title: 'Supprimer le plat', message: `« ${label} »\nCette action est irréversible.`, danger: true, confirmText: 'Supprimer' });
  if (!ok) return;
  try {
    await store.deleteProduct(p.id);
    toast('Supprimé', 'success');
  } catch {
    toast('Erreur', 'error');
  }
}
async function onSaveReward(payload) {
  try {
    await store.saveReward(payload);
    rewardModal.value = false;
    toast('Enregistré', 'success');
  } catch {
    toast('Erreur', 'error');
  }
}
async function onDeleteReward(id) {
  const ok = await confirmDialog({ title: 'Supprimer la récompense', message: 'Cette action est irréversible.', danger: true, confirmText: 'Supprimer' });
  if (!ok) return;
  await store.deleteReward(id);
  rewardModal.value = false;
  toast('Supprimé', 'success');
}

onMounted(() => store.load());
</script>
