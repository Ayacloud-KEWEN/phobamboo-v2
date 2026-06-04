<template>
  <div class="bg-slate-800 rounded-2xl border border-slate-700 p-5 mt-8">
    <h2 class="font-bold text-slate-300 mb-4"><i class="fas fa-gear mr-2 text-slate-400"></i>Paramètres (propriétaire)</h2>

    <div class="space-y-4">
      <!-- KDS toggle -->
      <div class="flex items-center justify-between">
        <div>
          <p class="font-semibold">Module Cuisine (KDS)</p>
          <p class="text-xs text-slate-400">Écran cuisine optionnel — désactivé par défaut</p>
        </div>
        <button @click="form.kdsEnabled = !form.kdsEnabled" class="w-12 h-7 rounded-full transition relative" :class="form.kdsEnabled ? 'bg-green-600' : 'bg-slate-600'">
          <span class="absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all" :class="form.kdsEnabled ? 'left-[22px]' : 'left-0.5'"></span>
        </button>
      </div>

      <!-- Points rule -->
      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="text-xs text-slate-400">Seuil journalier (€)</span>
          <input v-model.number="form.pointsThreshold" type="number" class="w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
        </label>
        <label class="block">
          <span class="text-xs text-slate-400">Points par €</span>
          <input v-model.number="form.pointsPerEuro" type="number" step="0.1" class="w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
        </label>
      </div>

      <button @click="save" :disabled="saving" class="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold disabled:opacity-50">
        <i v-if="saving" class="fas fa-circle-notch fa-spin mr-2"></i>Enregistrer
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '../../api/client';
import { useConfigStore } from '../../stores/config';
import { toast } from '../../composables/toast';

const cfg = useConfigStore();
const saving = ref(false);

const form = reactive({
  kdsEnabled: cfg.kdsEnabled,
  pointsThreshold: cfg.pointsThreshold,
  pointsPerEuro: cfg.pointsPerEuro,
});

async function save() {
  saving.value = true;
  try {
    const { data } = await api.put('/api/config', form);
    Object.assign(cfg, data);
    toast('Paramètres enregistrés', 'success');
  } catch {
    toast('Erreur (propriétaire requis)', 'error');
  } finally {
    saving.value = false;
  }
}
</script>
