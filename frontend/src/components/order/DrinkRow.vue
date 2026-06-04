<template>
  <div class="bg-white border-b border-gray-100 p-3 flex items-center justify-between fade-in hover:bg-gray-50 transition-colors">
    <div class="flex items-center flex-1 min-w-0 pr-3">
      <img v-if="product.image" :src="product.image" class="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0 mr-3 border border-gray-200" :alt="name" />
      <div class="flex flex-col min-w-0">
        <div class="flex items-center">
          <h3 class="font-bold text-gray-800 text-sm truncate mr-2">{{ name }}</h3>
          <i v-if="product.popular" class="fas fa-star text-[10px] text-amber-500"></i>
        </div>
        <div class="flex items-center">
          <span class="text-sm font-bold bamboo-text mr-2">{{ product.price.toFixed(2) }}€</span>
          <span v-if="product.description" class="text-xs text-gray-400 italic truncate">- {{ product.description }}</span>
        </div>
      </div>
    </div>
    <button
      @click="$emit('add', product)"
      class="flex-shrink-0 bamboo-gradient text-white w-8 h-8 rounded-full shadow-md flex items-center justify-center active:scale-90 transition"
      :aria-label="t('order.add')"
    >
      <span v-if="quantity" class="font-bold text-xs">{{ quantity }}</span>
      <i v-else class="fas fa-plus text-xs"></i>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { localizedName } from '../../i18n';

const props = defineProps({
  product: { type: Object, required: true },
  quantity: { type: Number, default: 0 },
});
defineEmits(['add']);
const { t } = useI18n();
const name = computed(() => localizedName(props.product));
</script>
