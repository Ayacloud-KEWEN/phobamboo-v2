<template>
  <div class="bg-slate-800 rounded-2xl border border-slate-700 p-5">
    <i :class="`fas ${icon} ${color}`" class="text-2xl mb-3"></i>
    <p class="text-2xl font-black">{{ value }}</p>
    <p class="text-xs text-slate-400 mt-1">{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({ icon: String, color: String, label: String, value: [String, Number] });
</script>
