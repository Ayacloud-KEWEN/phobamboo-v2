<template>
  <div>
    <div class="flex justify-between text-sm mb-1">
      <span class="font-semibold">{{ labelA }} <span class="text-slate-400">{{ a }} {{ suffix }} ({{ pctA }}%)</span></span>
      <span class="font-semibold text-right">{{ labelB }} <span class="text-slate-400">{{ b }} {{ suffix }}</span></span>
    </div>
    <div class="flex h-3 rounded-full overflow-hidden bg-slate-800">
      <div :class="colorA" :style="{ width: pctA + '%' }"></div>
      <div :class="colorB" :style="{ width: 100 - pctA + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  labelA: String,
  labelB: String,
  a: { type: Number, default: 0 },
  b: { type: Number, default: 0 },
  colorA: { type: String, default: 'bg-emerald-500' },
  colorB: { type: String, default: 'bg-slate-500' },
  suffix: { type: String, default: '' },
});
const pctA = computed(() => {
  const t = props.a + props.b;
  return t ? Math.round((props.a / t) * 100) : 0;
});
</script>
