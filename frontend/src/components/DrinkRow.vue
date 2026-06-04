<template>
  <div class="flex items-center justify-between py-3 border-b border-gray-200 border-dotted hover:bg-gray-50 transition-colors fade-in px-2">
    <div class="flex items-center flex-1 mr-4 min-w-0">
      <img
        v-if="product.image"
        :src="product.image"
        class="w-8 h-8 rounded-full object-cover mr-3 bg-gray-100 flex-shrink-0 border border-gray-200"
        :alt="name"
      />
      <div class="min-w-0">
        <div class="flex items-baseline gap-1">
          <h3 class="font-bold text-gray-800 text-base leading-none truncate">{{ name }}</h3>
          <span v-if="product.popular" class="text-amber-600 text-[10px]"><i class="fas fa-star"></i></span>
          <span v-if="product.spicy" class="text-red-600 text-[10px]"><i class="fas fa-pepper-hot"></i></span>
        </div>
        <p v-if="product.description" class="text-xs text-gray-400 mt-0.5 line-clamp-1">{{ product.description }}</p>
      </div>
    </div>
    <div class="flex items-center gap-3 flex-shrink-0">
      <span class="font-bold bamboo-text text-base">{{ product.price.toFixed(2) }}€</span>
      <button
        v-if="orderable"
        @click="$emit('add', product)"
        class="bamboo-bg text-white w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition"
        :aria-label="t('order.add')"
      >
        <i class="fas fa-plus text-sm"></i>
      </button>
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
