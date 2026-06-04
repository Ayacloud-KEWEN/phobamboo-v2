<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden fade-in border border-bamboo-light/40 flex flex-col h-full">
    <div class="relative h-48 flex-shrink-0">
      <img :src="product.image || '/NA.png'" :alt="name" class="w-full h-full object-cover" loading="lazy" />
      <div class="absolute top-3 left-3 flex gap-1 flex-wrap">
        <span v-if="product.popular" class="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold shadow-sm"><i class="fas fa-star text-[10px] mr-1"></i>{{ t('tags.popular') }}</span>
        <span v-if="product.spicy" class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold shadow-sm"><i class="fas fa-pepper-hot text-[10px] mr-1"></i>{{ t('tags.spicy') }}</span>
        <span v-if="product.vegan" class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold shadow-sm"><i class="fas fa-leaf text-[10px] mr-1"></i>{{ t('tags.vegan') }}</span>
      </div>
      <div class="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow">
        <span class="text-xl font-bold bamboo-text">{{ product.price.toFixed(2) }}€</span>
      </div>
    </div>
    <div class="p-4 flex flex-col flex-1">
      <h3 class="text-lg font-bold bamboo-text leading-tight mb-1">{{ name }}</h3>
      <p v-if="product.description" class="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{{ product.description }}</p>
      <div class="flex items-center justify-between mt-auto pt-2">
        <div class="text-xs text-gray-500 flex items-center">
          <i class="fas fa-coins text-amber-500 mr-1"></i>{{ Math.floor(product.price) }} {{ t('order.points') }}
        </div>
        <button
          @click="$emit('add', product)"
          class="bamboo-gradient text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-md active:scale-95 transition"
        >
          <i class="fas fa-plus mr-2"></i>{{ t('order.add') }}<span v-if="quantity"> ({{ quantity }})</span>
        </button>
      </div>
    </div>
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
