<template>
  <div class="bg-slate-800 rounded-2xl border border-slate-700 p-5 mt-8">
    <h2 class="font-bold text-slate-300 mb-2"><i class="fas fa-comment-sms mr-2 text-blue-400"></i>SMS aux clients opt-in</h2>
    <p class="text-xs text-slate-400 mb-4">
      Clients ayant accepté de recevoir des offres par SMS. Rédigez votre message,
      puis touchez « SMS » pour l'ouvrir dans l'app de messages de votre téléphone.
    </p>

    <textarea
      v-model="message"
      rows="3"
      maxlength="480"
      placeholder="Ex: 🎋 Pho Bamboo: -10% ce midi sur présentation de ce SMS !"
      class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 mb-3"
    ></textarea>

    <div class="flex items-center justify-between mb-3">
      <span class="text-sm text-slate-400"><i class="fas fa-users mr-1"></i><b class="text-white">{{ contacts.length }}</b> contacts</span>
      <button v-if="contacts.length" @click="copyNumbers" class="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg font-bold">
        <i class="fas fa-copy mr-1"></i>Copier les numéros
      </button>
    </div>

    <div v-if="loading" class="text-center text-slate-500 py-4"><i class="fas fa-circle-notch fa-spin"></i></div>
    <div v-else-if="!contacts.length" class="text-slate-500 text-sm text-center py-4">Aucun client opt-in pour le moment.</div>
    <div v-else class="space-y-2 max-h-80 overflow-y-auto">
      <div v-for="c in contacts" :key="c.phone" class="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2">
        <div class="min-w-0">
          <p class="font-semibold truncate">{{ c.name || 'Client' }}</p>
          <p class="text-xs text-slate-400 font-mono">{{ c.phone }}</p>
        </div>
        <a :href="smsLink(c.phone)" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0">
          <i class="fas fa-paper-plane mr-1"></i>SMS
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { toast } from '../../composables/toast';

const message = ref('');
const contacts = ref([]);
const loading = ref(true);

function smsLink(phone) {
  const body = message.value ? `?&body=${encodeURIComponent(message.value)}` : '';
  return `sms:${phone}${body}`;
}

async function copyNumbers() {
  const nums = contacts.value.map((c) => c.phone).join(',');
  try {
    await navigator.clipboard.writeText(nums);
    toast('Numéros copiés', 'success');
  } catch {
    toast('Copie impossible', 'error');
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/api/members');
    contacts.value = data
      .filter((m) => m.acceptsSMS && m.phone)
      .map((m) => ({ phone: m.phone, name: m.name }));
  } catch {
    /* ignore */
  } finally {
    loading.value = false;
  }
});
</script>
