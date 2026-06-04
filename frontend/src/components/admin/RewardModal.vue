<template>
  <div class="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
      <div class="border-b px-5 py-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">{{ form.id ? 'Modifier la récompense' : 'Nouvelle récompense' }}</h2>
        <button @click="$emit('close')" class="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500"><i class="fas fa-times"></i></button>
      </div>

      <div class="p-5 space-y-4">
        <Field label="Nom (FR) 🇫🇷"><input v-model="form.nameFr" class="inp" /></Field>
        <Field label="Nom (EN) 🇬🇧"><input v-model="form.nameEn" class="inp" /></Field>
        <Field label="名称 (中文) 🇨🇳"><input v-model="form.nameZh" class="inp" /></Field>
        <Field label="Coût (points)"><input v-model.number="form.cost" type="number" class="inp" /></Field>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.active" /> Active</label>
      </div>

      <div class="border-t px-5 py-4 flex gap-3">
        <button v-if="form.id" @click="$emit('delete', form.id)" class="px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"><i class="fas fa-trash"></i></button>
        <button @click="$emit('save', { ...form })" class="flex-1 bamboo-bg text-white py-3 rounded-xl font-bold">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import Field from './Field.vue';

const props = defineProps({ reward: { type: Object, default: null } });
defineEmits(['close', 'save', 'delete']);

const form = reactive({
  id: props.reward?.id || null,
  nameFr: props.reward?.nameFr || '',
  nameEn: props.reward?.nameEn || '',
  nameZh: props.reward?.nameZh || '',
  cost: props.reward?.cost ?? 0,
  active: props.reward?.active ?? true,
});
</script>

<style scoped>
.inp {
  @apply w-full border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-bamboo-secondary;
}
</style>
