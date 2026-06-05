<template>
  <div>
    <!-- Overlay -->
    <transition enter-active-class="transition" enter-from-class="opacity-0" leave-active-class="transition" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 bg-black/50 z-40" @click="close"></div>
    </transition>

    <!-- Sidebar -->
    <div
      class="fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="bamboo-gradient text-white p-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button @click="close" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"><i class="fas fa-arrow-left"></i></button>
            <h3 class="text-xl font-bold">{{ t('order.yourOrder') }}</h3>
          </div>
          <div v-if="cart.table" class="text-right">
            <p class="text-sm opacity-90">{{ t('order.table') }} {{ cart.table }}</p>
          </div>
        </div>
        <div class="mt-6 bg-white/10 rounded-lg p-4 flex justify-between items-center">
          <div>
            <p class="text-sm">{{ cart.count }} {{ articlesLabel }}</p>
            <p class="text-xs" :class="member.loggedIn && cart.total >= threshold ? 'text-green-200' : 'opacity-90'">
              <template v-if="cart.total >= threshold">+{{ cart.pointsToEarn }} {{ t('order.points') }}</template>
              <template v-else>{{ t('order.minForPoints') }}</template>
            </p>
          </div>
          <p class="text-2xl font-bold">{{ cart.total.toFixed(2) }}€</p>
        </div>
      </div>

      <!-- Items -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="!cart.items.length" class="text-center py-12">
          <p class="bamboo-text font-bold">{{ t('order.empty') }}</p>
        </div>
        <div
          v-for="i in cart.items"
          :key="i.id"
          class="rounded-lg p-3 mb-3 fade-in flex items-center"
          :class="i.isReward ? 'bg-yellow-50' : 'bg-gray-50'"
        >
          <img :src="i.image || '/NA.png'" class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
          <div class="ml-3 flex-1 min-w-0">
            <h4 class="font-bold text-sm truncate">{{ itemName(i) }}</h4>
            <p class="text-xs" :class="i.isReward ? 'text-green-600 font-bold' : 'text-gray-500'">
              <template v-if="i.isReward"><span class="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded font-bold">-{{ i.pointsCost }} {{ t('order.points') }}</span></template>
              <template v-else>{{ i.price.toFixed(2) }}€</template>
            </p>
          </div>
          <div class="flex flex-col items-end pl-2">
            <div v-if="!i.isReward" class="flex items-center space-x-2 mb-1">
              <button @click="cart.setQuantity(i.id, i.quantity - 1)" class="w-6 h-6 rounded-full border bg-white flex justify-center items-center"><i class="fas fa-minus text-[10px]"></i></button>
              <span class="font-bold text-sm w-4 text-center">{{ i.quantity }}</span>
              <button @click="cart.setQuantity(i.id, i.quantity + 1)" class="w-6 h-6 rounded-full border bg-white flex justify-center items-center"><i class="fas fa-plus text-[10px]"></i></button>
            </div>
            <span v-else class="text-xs bg-yellow-200 px-2 py-1 rounded text-yellow-800 font-bold mb-1">{{ t('order.gift') }}</span>
            <div class="flex items-center">
              <span v-if="!i.isReward" class="font-bold text-sm mr-3">{{ (i.price * i.quantity).toFixed(2) }}€</span>
              <button @click="cart.remove(i.id)" class="text-red-400"><i class="fas fa-trash text-xs"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t p-4 bg-gray-50">
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <label class="text-gray-700 font-medium">{{ t('order.specialInstructions') }}</label>
            <button @click="addSuggestion" class="text-xs bamboo-text">{{ t('order.suggestions') }}</button>
          </div>
          <textarea
            v-model="cart.notes"
            rows="2"
            :placeholder="t('order.instructionsPlaceholder')"
            class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          ></textarea>
        </div>
        <button
          @click="checkout"
          :disabled="sending || !cart.items.length"
          class="w-full bamboo-gradient text-white py-4 px-5 rounded-xl font-bold shadow-xl flex items-center justify-center active:scale-95 transition disabled:opacity-50"
        >
          <i :class="sending ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'" class="mr-2 text-xl"></i>
          <span class="text-lg">{{ sending ? t('order.sending') : t('order.send') }}</span>
        </button>
        <p class="text-[10px] text-gray-400 text-center leading-tight px-2 mt-4">
          <span class="block mb-1">{{ t('order.payNote') }}</span>{{ t('order.cgv') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCartStore } from '../../stores/cart';
import { useMemberStore } from '../../stores/member';
import { useConfigStore } from '../../stores/config';
import { localizedName } from '../../i18n';
import { toast } from '../../composables/toast';
import { confirmDialog } from '../../composables/confirm';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open', 'sent', 'login']);

const { t } = useI18n();
const cart = useCartStore();
const member = useMemberStore();
const cfg = useConfigStore();
const sending = ref(false);

const threshold = computed(() => cfg.pointsThreshold ?? 20);
const articlesLabel = computed(() => t('order.articles', cart.count));
const itemName = (i) => localizedName(i);

const SUGGESTIONS = ['Sans coriandre', 'Extra piment', 'Sauce à part', 'Bien cuit'];
function addSuggestion() {
  const s = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
  cart.notes = cart.notes ? `${cart.notes}, ${s}` : s;
}

function close() {
  emit('update:open', false);
}

async function checkout() {
  if (!cart.items.length) return;
  // Guests: offer to log in before sending (no points otherwise).
  if (!member.loggedIn) {
    const continueGuest = await confirmDialog({
      title: t('order.noPointsTitle'),
      message: t('order.noPointsMsg'),
      confirmText: t('login.guest'),
      cancelText: t('login.submit'),
    });
    if (continueGuest) await send();
    else emit('login');
    return;
  }
  await send();
}

async function send() {
  sending.value = true;
  try {
    await cart.submit();
    toast(t('order.sent'), 'success');
    emit('sent');
    emit('update:open', false);
  } catch (e) {
    const code = e?.response?.data?.error;
    toast(code === 'INSUFFICIENT_POINTS' ? t('loyalty.notEnoughMsg') : t('menu.error'), 'error');
  } finally {
    sending.value = false;
  }
}
</script>
