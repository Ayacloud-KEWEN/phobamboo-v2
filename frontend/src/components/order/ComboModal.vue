<template>
  <div class="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl relative">
      <div class="bamboo-gradient p-5 text-white">
        <h3 class="text-xl font-bold">{{ name }}</h3>
        <p class="text-sm opacity-90">{{ t('combo.question') }}</p>
        <button @click="$emit('close')" class="absolute top-4 right-4 bg-white/20 hover:bg-white/30 w-8 h-8 rounded-full flex items-center justify-center"><i class="fas fa-times"></i></button>
      </div>

      <div class="p-6 bg-gray-50">
        <label class="flex items-center justify-between bg-white p-4 rounded-xl border-2 cursor-pointer mb-4 shadow-sm" :class="withCombo ? 'border-gray-200' : 'border-green-500'">
          <span class="font-bold text-gray-700">{{ t('combo.justDish') }}</span>
          <input type="radio" :value="false" v-model="withCombo" class="w-5 h-5 text-green-600" />
        </label>

        <template v-if="entrees.length">
          <label class="flex items-center justify-between bg-white p-4 rounded-xl border-2 cursor-pointer mb-3 shadow-sm" :class="withCombo ? 'border-green-500' : 'border-gray-200'">
            <span class="font-bold text-gray-700 flex items-center"><i class="fas fa-utensils text-yellow-500 mr-2"></i>{{ t('combo.formule') }}</span>
            <input type="radio" :value="true" v-model="withCombo" class="w-5 h-5 text-green-600" />
          </label>

          <div v-if="withCombo" class="grid grid-cols-3 gap-2 mt-2">
            <label v-for="e in entrees" :key="e.id" class="text-center cursor-pointer">
              <input type="radio" :value="e.id" v-model="selectedEntree" class="hidden" />
              <div class="border-2 rounded-lg p-2 h-full flex flex-col items-center justify-center transition" :class="selectedEntree === e.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'">
                <img :src="e.image || '/NA.png'" class="w-full h-12 object-cover rounded mb-1 bg-white border border-gray-100 p-0.5" />
                <span class="text-xs font-bold text-gray-600 line-clamp-2 leading-tight">{{ eName(e) }}</span>
              </div>
            </label>
          </div>
        </template>
      </div>

      <div class="p-4 bg-white border-t border-gray-100">
        <button @click="confirm" class="w-full bamboo-gradient text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition flex justify-between px-6">
          <span>{{ t('combo.addToCart') }}</span>
          <span>{{ finalPrice.toFixed(2) }} €</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { localizedName } from '../../i18n';
import { useConfigStore } from '../../stores/config';

const props = defineProps({
  product: { type: Object, required: true },
  entrees: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'confirm']);

const { t } = useI18n();
const cfg = useConfigStore();
const withCombo = ref(false);
const selectedEntree = ref(props.entrees[0]?.id || null);

const name = computed(() => localizedName(props.product));
const eName = (e) => localizedName(e);
const finalPrice = computed(() => props.product.price + (withCombo.value ? (cfg.comboPrice ?? 3.8) : 0));

function confirm() {
  const entree = withCombo.value ? props.entrees.find((e) => e.id === selectedEntree.value) : null;
  emit('confirm', entree);
}
</script>
