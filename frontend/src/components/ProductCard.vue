<template>
  <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col fade-in">
    <div class="relative h-40 bg-gray-100">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="name"
        loading="lazy"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
        <i class="fa-solid fa-bowl-food text-4xl"></i>
      </div>
      <div class="absolute top-2 left-2 flex gap-1">
        <span v-if="product.popular" class="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <i class="fas fa-star mr-0.5"></i>{{ t('tags.popular') }}
        </span>
        <span v-if="product.spicy" class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <i class="fas fa-pepper-hot mr-0.5"></i>{{ t('tags.spicy') }}
        </span>
        <span v-if="product.vegan" class="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <i class="fas fa-leaf mr-0.5"></i>{{ t('tags.vegan') }}
        </span>
      </div>
    </div>

    <div class="p-4 flex flex-col flex-1">
      <h3 class="font-bold text-gray-800 leading-snug">{{ name }}</h3>
      <p v-if="product.description" class="text-sm text-gray-500 mt-1 line-clamp-2">{{ product.description }}</p>
      <div class="mt-auto pt-3 flex items-center justify-between">
        <span class="text-lg font-extrabold bamboo-text">{{ product.price.toFixed(2) }} €</span>
        <button
          v-if="orderable"
          @click="$emit('add', product)"
          class="bamboo-bg text-white w-9 h-9 rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition"
          :aria-label="t('order.add')"
        >
          <i class="fas fa-plus"></i>
        </button>
      </div>
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
