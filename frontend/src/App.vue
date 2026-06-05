<template>
  <router-view />
  <ConfirmDialog />
</template>

<script setup>
// Root shell — each view renders its own chrome (customer vs admin layouts differ).
// ConfirmDialog is global so any page can call confirmDialog().
import ConfirmDialog from './components/ConfirmDialog.vue';
</script>
