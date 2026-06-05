<template>
  <div>
    <template v-for="group in groups" :key="group.key">
      <!-- Sub-category header (menus / plats / boissons / alcool) -->
      <div v-if="group.key !== 'General'" class="mt-6 mb-3 border-b border-gray-200 pb-1 fade-in">
        <h3 class="text-xl font-bold bamboo-text uppercase tracking-wide flex items-center">
          <i class="fas fa-caret-right mr-2 opacity-50"></i>{{ clean(group.key) }}
        </h3>
      </div>

      <!-- Drinks & alcohol → list rows (2 columns on desktop) -->
      <div v-if="isDrink" class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 max-w-5xl mx-auto mb-6">
        <DrinkRow
          v-for="p in group.items"
          :key="p.id"
          :product="p"
          :orderable="orderable"
          @add="$emit('add', $event)"
        />
      </div>

      <!-- Food → cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        <ProductCard
          v-for="p in group.items"
          :key="p.id"
          :product="p"
          :orderable="orderable"
          @add="$emit('add', $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMenuStore } from '../stores/menu';
import ProductCard from './ProductCard.vue';
import DrinkRow from './DrinkRow.vue';

const props = defineProps({
  category: { type: String, required: true },
  orderable: { type: Boolean, default: false },
});
defineEmits(['add']);

const menu = useMenuStore();

// These categories are grouped by sub-category with section headers.
const GROUPED = ['menus', 'plats', 'boissons', 'alcool'];
const isDrink = computed(() => props.category === 'boissons' || props.category === 'alcool');

// Sub-categories often carry a sort prefix like "0- " — hide it in the header.
const clean = (k) => k.replace(/^\s*\d+\s*[-.)]?\s*/, '');

const groups = computed(() => {
  const items = menu.byCategory(props.category);
  if (!GROUPED.includes(props.category)) return [{ key: 'General', items }];

  const map = {};
  for (const it of items) {
    const key = it.subCategory || 'General';
    (map[key] ||= []).push(it);
  }
  // Alphabetical sub-category order (sub-categories are usually prefixed 0-,1-,…).
  return Object.keys(map)
    .sort()
    .map((key) => ({ key, items: map[key] }));
});
</script>
