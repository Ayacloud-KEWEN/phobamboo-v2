<template>
  <transition enter-active-class="transition" enter-from-class="opacity-0" leave-active-class="transition" leave-to-class="opacity-0">
    <div v-if="open" class="fixed inset-0 z-[60] bg-black/40" @click.self="close">
      <transition
        enter-active-class="transition duration-300" enter-from-class="translate-y-full"
        leave-active-class="transition duration-200" leave-to-class="translate-y-full"
      >
        <div v-if="open" class="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col">
          <div class="p-4 border-b flex items-center justify-between">
            <h2 class="text-lg font-bold bamboo-text"><i class="fas fa-basket-shopping mr-2"></i>{{ t('order.cart') }}</h2>
            <button @click="close" class="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500"><i class="fas fa-times"></i></button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <p v-if="!cart.items.length" class="text-center text-gray-400 py-10">{{ t('order.empty') }}</p>
            <div v-for="i in cart.items" :key="i.id" class="flex items-center gap-3">
              <div class="flex-1">
                <p class="font-semibold text-gray-800">{{ itemName(i) }}</p>
                <p class="text-sm bamboo-text font-bold">{{ i.price.toFixed(2) }} €</p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="cart.setQuantity(i.id, i.quantity - 1)" class="w-8 h-8 rounded-full bg-gray-100 text-gray-600"><i class="fas fa-minus text-xs"></i></button>
                <span class="w-6 text-center font-bold">{{ i.quantity }}</span>
                <button @click="cart.setQuantity(i.id, i.quantity + 1)" class="w-8 h-8 rounded-full bamboo-bg text-white"><i class="fas fa-plus text-xs"></i></button>
              </div>
            </div>

            <textarea
              v-if="cart.items.length"
              v-model="cart.notes"
              :placeholder="t('order.notes')"
              rows="2"
              class="w-full mt-2 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-bamboo-secondary outline-none"
            ></textarea>
          </div>

          <div v-if="cart.items.length" class="p-4 border-t space-y-3">
            <div v-if="member.loggedIn" class="flex justify-between text-sm text-gray-500">
              <span><i class="fas fa-star text-amber-400 mr-1"></i>+{{ cart.pointsToEarn }} {{ t('loyalty.points') }}</span>
              <span>{{ t('loyalty.yourPoints') }}: {{ member.points }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">{{ t('order.total') }}</span>
              <span class="text-2xl font-extrabold bamboo-text">{{ cart.total.toFixed(2) }} €</span>
            </div>
            <button
              @click="submit"
              :disabled="sending"
              class="w-full bamboo-bg text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 active:scale-[0.99] transition"
            >
              <i v-if="sending" class="fas fa-circle-notch fa-spin mr-2"></i>
              {{ sending ? t('order.sending') : t('order.send') }}
            </button>
            <button v-if="!member.loggedIn" @click="$emit('login')" class="w-full text-sm text-gray-500 underline">
              {{ t('loyalty.login') }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCartStore } from '../stores/cart';
import { useMemberStore } from '../stores/member';
import { localizedName } from '../i18n';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open', 'login', 'sent']);

const { t } = useI18n();
const cart = useCartStore();
const member = useMemberStore();
const sending = ref(false);

const itemName = (i) => localizedName(i);

function close() {
  emit('update:open', false);
}

async function submit() {
  sending.value = true;
  try {
    await cart.submit();
    alert(t('order.sent'));
    emit('sent');
  } catch (e) {
    const code = e?.response?.data?.error;
    alert(code === 'INSUFFICIENT_POINTS' ? t('loyalty.notEnough') : t('menu.error'));
  } finally {
    sending.value = false;
  }
}
</script>
