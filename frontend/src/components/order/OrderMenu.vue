<template>
  <div>
    <template v-for="group in groups" :key="group.key">
      <!-- Sub-category header -->
      <div v-if="group.key !== 'General'" class="mt-5 mb-2 px-2 flex items-center fade-in">
        <div class="h-4 w-1 bg-green-600 rounded-full mr-2"></div>
        <h3 class="text-lg font-bold text-gray-800 uppercase tracking-wide">{{ group.key }}</h3>
        <div class="ml-3 h-px bg-gray-200 flex-1"></div>
      </div>

      <div v-if="isDrink" class="mb-4">
        <DrinkRow
          v-for="p in group.items"
          :key="p.id"
          :product="p"
          :quantity="cart.quantityOf(p.id)"
          @add="$emit('add', $event)"
        />
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <DishCard
          v-for="p in group.items"
          :key="p.id"
          :product="p"
          :quantity="cart.quantityOf(p.id)"
          @add="$emit('add', $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useCartStore } from '../../stores/cart';
import DishCard from './DishCard.vue';
import DrinkRow from './DrinkRow.vue';

const props = defineProps({ category: { type: String, required: true } });
defineEmits(['add']);

const menu = useMenuStore();
const cart = useCartStore();

const GROUPED = ['menus', 'plats', 'boissons', 'alcool'];
const isDrink = computed(() => props.category === 'boissons' || props.category === 'alcool');

const groups = computed(() => {
  const items = menu.byCategory(props.category);
  if (!GROUPED.includes(props.category)) return [{ key: 'General', items }];
  const map = {};
  for (const it of items) {
    const key = it.subCategory || 'General';
    (map[key] ||= []).push(it);
  }
  return Object.keys(map).sort().map((key) => ({ key, items: map[key] }));
});
</script>
