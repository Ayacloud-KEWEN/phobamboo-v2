<template>
  <!-- Desktop pills (only when not in mobile/nav mode) -->
  <div v-if="!mobile" class="hidden sm:flex justify-center flex-wrap gap-3 fade-in">
    <button
      v-for="c in categories"
      :key="c"
      @click="$emit('update:modelValue', c)"
      class="category-btn px-6 py-2 rounded-full transition shadow-sm hover:shadow-md"
      :class="c === modelValue ? 'category-active' : 'category-inactive'"
    >
      {{ t(`categories.${c}`) }}
    </button>
  </div>

  <!-- Mobile scrollable pills (rendered inside the green nav) -->
  <div v-if="mobile" class="sm:hidden py-3 border-t border-white/10">
    <div class="flex overflow-x-auto scrollbar-hide space-x-2 pb-1">
      <button
        v-for="c in categories"
        :key="c"
        @click="$emit('update:modelValue', c)"
        class="category-btn flex-shrink-0 px-4 py-1.5 rounded-full text-sm"
        :class="c === modelValue ? 'category-active-mobile' : 'category-inactive-mobile'"
      >
        {{ t(`categories.${c}`) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  mobile: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
const { t } = useI18n();
</script>
