<template>
  <div>
    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ label }}</label>
    <slot />
  </div>
</template>

<script setup>
defineProps({ label: String });
</script>
