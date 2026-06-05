<template>
  <div class="fixed inset-0 bg-black/70 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="$emit('close')">
    <div class="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
      <div class="bamboo-gradient p-6 text-white text-center relative">
        <button @click="$emit('close')" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20"><i class="fas fa-times"></i></button>
        <i class="fas fa-crown text-3xl text-yellow-300 mb-2"></i>
        <h3 class="text-xl font-bold">{{ t('login.title') }}</h3>
      </div>

      <div class="p-6 space-y-4">
        <p class="text-sm text-gray-600">{{ t('login.message') }}</p>
        <input
          v-model="phone"
          type="tel"
          inputmode="tel"
          :placeholder="t('login.placeholder')"
          class="w-full border-2 border-gray-200 rounded-xl p-3 text-lg text-center font-bold focus:border-green-600 outline-none"
          @keyup.enter="submit"
        />

        <label class="flex items-start p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition">
          <input type="checkbox" v-model="acceptTerms" class="w-5 h-5 mt-0.5 text-green-600 rounded" />
          <span class="ml-3 flex-1">
            <span class="text-sm font-bold text-gray-800">{{ t('login.account') }} <span class="text-red-500">*</span></span>
            <span class="text-xs text-gray-500 mt-1 block leading-tight">
              <a href="/politique-confidentialite.html" target="_blank" class="text-green-700 font-bold underline">{{ t('login.consentTerms') }}</a>
            </span>
          </span>
        </label>

        <label class="flex items-start p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-green-300 transition">
          <input type="checkbox" v-model="acceptOffers" class="w-5 h-5 mt-0.5 text-green-600 rounded" />
          <span class="ml-3 flex-1">
            <span class="text-sm font-bold text-gray-700 flex items-center"><i class="fas fa-gift text-yellow-500 mr-2"></i>{{ t('login.offers') }}</span>
            <span class="text-xs text-gray-500 mt-1 block leading-tight">{{ t('login.offersDesc') }}</span>
          </span>
        </label>

        <button
          @click="submit"
          :disabled="!acceptTerms || busy"
          class="w-full bamboo-gradient text-white py-3 rounded-xl font-bold disabled:opacity-50 transition"
        >
          <i v-if="busy" class="fas fa-spinner fa-spin mr-2"></i>{{ t('login.submit') }}
        </button>
        <button @click="$emit('close')" class="w-full text-sm text-gray-400">{{ t('login.guest') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMemberStore } from '../../stores/member';
import { toast } from '../../composables/toast';

const emit = defineEmits(['close', 'success']);
const { t } = useI18n();
const member = useMemberStore();

const phone = ref('');
const acceptTerms = ref(false);
const acceptOffers = ref(false);
const busy = ref(false);

function normalize(p) {
  let clean = p.trim().replace(/\s/g, '');
  if (clean.length === 9 && !clean.startsWith('0')) clean = '0' + clean;
  return clean;
}

async function submit() {
  const clean = normalize(phone.value);
  if (clean.length !== 10 || !clean.startsWith('0')) {
    toast(`${t('login.invalid')} — ${t('login.invalidMsg')}`, 'error');
    return;
  }
  busy.value = true;
  try {
    await member.login(clean, acceptOffers.value);
    emit('success');
    emit('close');
  } catch {
    toast(t('menu.error'), 'error');
  } finally {
    busy.value = false;
  }
}
</script>
