<template>
  <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full fade-in group">
    <div class="relative h-48 overflow-hidden">
      <img
        :src="product.image || '/NA.png'"
        :alt="name"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <!-- Tags -->
      <div class="absolute top-3 left-3 flex flex-wrap gap-1">
        <span v-if="product.popular" class="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold shadow-sm">
          <i class="fas fa-star text-[10px] mr-1"></i>{{ t('tags.popular') }}
        </span>
        <span v-if="product.spicy" class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold shadow-sm">
          <i class="fas fa-pepper-hot text-[10px] mr-1"></i>{{ t('tags.spicy') }}
        </span>
        <span v-if="product.vegan" class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold shadow-sm">
          <i class="fas fa-leaf text-[10px] mr-1"></i>{{ t('tags.vegan') }}
        </span>
      </div>
      <!-- Price badge -->
      <div class="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md border border-gray-100">
        <span class="text-lg font-bold bamboo-text">{{ product.price.toFixed(2) }}€</span>
      </div>
      <!-- Add button (ordering page only) -->
      <button
        v-if="orderable"
        @click="$emit('add', product)"
        class="absolute bottom-3 left-3 bamboo-bg text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition"
        :aria-label="t('order.add')"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <h3 class="text-lg font-bold text-gray-800 leading-tight mb-1">{{ name }}</h3>
      <p v-if="product.description" class="text-gray-500 text-sm leading-relaxed">{{ product.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { localizedName } from '../i18n';

const props = defineProps({
  product: { type: Object, required: true },
  orderable: { type: Boolean, default: false },
});
defineEmits(['add']);

const { t } = useI18n();
const name = computed(() => localizedName(props.product));
</script>
