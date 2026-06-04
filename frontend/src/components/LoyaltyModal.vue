<template>
  <transition enter-active-class="transition" enter-from-class="opacity-0" leave-active-class="transition" leave-to-class="opacity-0">
    <div v-if="open" class="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="close">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div class="bamboo-gradient text-white p-6 rounded-t-3xl text-center relative">
          <button @click="close" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20"><i class="fas fa-times"></i></button>
          <i class="fas fa-award text-4xl mb-2"></i>
          <h2 class="text-xl font-bold">{{ t('loyalty.title') }}</h2>
          <p v-if="member.loggedIn" class="mt-2 text-3xl font-extrabold">{{ member.points }} <span class="text-base font-normal">{{ t('loyalty.points') }}</span></p>
        </div>

        <div class="p-6">
          <!-- Login -->
          <div v-if="!member.loggedIn" class="space-y-4">
            <label class="block text-sm font-semibold text-gray-600">{{ t('loyalty.phone') }}</label>
            <input
              v-model="phone"
              type="tel"
              inputmode="tel"
              placeholder="06 12 34 56 78"
              class="w-full border rounded-xl p-3 focus:ring-2 focus:ring-bamboo-secondary outline-none"
            />
            <label class="flex items-start gap-2 text-sm text-gray-500">
              <input v-model="acceptsSMS" type="checkbox" class="mt-1" />
              <span>{{ t('loyalty.smsConsent') }}</span>
            </label>
            <button @click="login" :disabled="!phone || busy" class="w-full bamboo-bg text-white py-3 rounded-xl font-bold disabled:opacity-50">
              {{ t('loyalty.loginBtn') }}
            </button>
            <button @click="close" class="w-full text-sm text-gray-400">{{ t('loyalty.guest') }}</button>
          </div>

          <!-- Rewards -->
          <div v-else>
            <h3 class="font-bold text-gray-700 mb-3">{{ t('loyalty.rewards') }}</h3>
            <p v-if="!menu.rewards.length" class="text-sm text-gray-400 text-center py-6">—</p>
            <div v-for="r in menu.rewards" :key="r.id" class="flex items-center justify-between border rounded-xl p-3 mb-2">
              <div>
                <p class="font-semibold text-gray-800">{{ rewardName(r) }}</p>
                <p class="text-sm text-amber-600 font-bold"><i class="fas fa-star mr-1"></i>{{ r.cost }}</p>
              </div>
              <span
                class="text-xs px-3 py-1 rounded-full font-bold"
                :class="member.points >= r.cost ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'"
              >
                {{ member.points >= r.cost ? t('loyalty.redeem') : t('loyalty.notEnough') }}
              </span>
            </div>
            <button @click="logout" class="w-full text-sm text-gray-400 mt-4">{{ t('common.close') }} · {{ member.phone }}</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMemberStore } from '../stores/member';
import { useMenuStore } from '../stores/menu';
import { localizedName } from '../i18n';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const { t } = useI18n();
const member = useMemberStore();
const menu = useMenuStore();

const phone = ref('');
const acceptsSMS = ref(false);
const busy = ref(false);

const rewardName = (r) => localizedName(r);

function close() {
  emit('update:open', false);
}

async function login() {
  busy.value = true;
  try {
    await member.login(phone.value, acceptsSMS.value);
  } catch {
    alert(t('menu.error'));
  } finally {
    busy.value = false;
  }
}

function logout() {
  member.logout();
  close();
}
</script>
