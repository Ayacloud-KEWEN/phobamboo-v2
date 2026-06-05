<template>
  <div class="bg-slate-800 rounded-2xl border border-slate-700 p-5 mt-8">
    <h2 class="font-bold text-slate-300 mb-4"><i class="fas fa-comment-sms mr-2 text-blue-400"></i>SMS marketing (propriétaire)</h2>

    <div class="flex items-center justify-between text-sm mb-4">
      <span class="text-slate-400">
        <i class="fas fa-users mr-1"></i><b class="text-white">{{ audience }}</b> membres opt-in
      </span>
      <span :class="configured ? 'text-emerald-400' : 'text-amber-400'">
        <i class="fas fa-circle text-[8px] mr-1"></i>{{ configured ? provider : 'simulation (non configuré)' }}
      </span>
    </div>

    <textarea
      v-model="message"
      rows="3"
      maxlength="480"
      placeholder="Ex: 🎋 Pho Bamboo: -10% ce midi sur présentation de ce SMS !"
      class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500"
    ></textarea>
    <div class="text-right text-xs text-slate-500 mb-3">{{ message.length }}/480</div>

    <div class="flex flex-wrap gap-2">
      <input v-model="testTo" placeholder="N° de test" class="flex-1 min-w-[120px] bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
      <button @click="sendTest" :disabled="busy || !message" class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">Test</button>
      <button @click="broadcast" :disabled="busy || !message || !audience" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
        <i v-if="busy" class="fas fa-circle-notch fa-spin mr-1"></i>Envoyer à {{ audience }}
      </button>
    </div>
    <p v-if="!configured" class="text-xs text-amber-400/80 mt-3">
      Mode simulation : aucun SMS réel n'est envoyé. Configurez un fournisseur dans backend/.env (SMS_PROVIDER) pour activer l'envoi.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { toast } from '../../composables/toast';
import { confirmDialog } from '../../composables/confirm';

const audience = ref(0);
const configured = ref(false);
const provider = ref('none');
const message = ref('');
const testTo = ref('');
const busy = ref(false);

onMounted(async () => {
  try {
    const { data } = await api.get('/api/marketing/audience');
    audience.value = data.count;
    configured.value = data.configured;
    provider.value = data.provider;
  } catch {
    /* not owner / error */
  }
});

async function sendTest() {
  if (!testTo.value) return toast('Numéro de test requis', 'error');
  busy.value = true;
  try {
    const { data } = await api.post('/api/marketing/test', { to: testTo.value, message: message.value });
    toast(data.ok ? (data.simulated ? 'Test simulé (voir logs)' : 'Test envoyé') : 'Échec test', data.ok ? 'success' : 'error');
  } catch {
    toast('Erreur', 'error');
  } finally {
    busy.value = false;
  }
}

async function broadcast() {
  const ok = await confirmDialog({
    title: 'Envoyer la campagne',
    message: `Envoyer ce SMS à ${audience.value} membres ?`,
    confirmText: 'Envoyer',
  });
  if (!ok) return;
  busy.value = true;
  try {
    const { data } = await api.post('/api/marketing/send', { message: message.value });
    toast(`${data.sent} envoyés${data.failed ? ', ' + data.failed + ' échecs' : ''}${data.simulated ? ' (simulé)' : ''}`, 'success');
  } catch {
    toast('Erreur envoi', 'error');
  } finally {
    busy.value = false;
  }
}
</script>
