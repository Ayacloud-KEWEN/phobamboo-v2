<template>
  <router-view />
  <ConfirmDialog />
  <ToastHost />
</template>

<script setup>
// Root shell — each view renders its own chrome (customer vs admin layouts differ).
// ConfirmDialog + ToastHost are global so any page can use confirmDialog()/toast().
import ConfirmDialog from './components/ConfirmDialog.vue';
import ToastHost from './components/ToastHost.vue';
</script>
