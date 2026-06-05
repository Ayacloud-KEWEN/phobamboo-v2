<template>
  <div class="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="bamboo-gradient p-6 text-white">
        <div class="flex justify-between items-center mb-4">
          <button @click="$emit('logout')" class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg"><i class="fas fa-sign-out-alt mr-1"></i>{{ t('loyalty.change') }}</button>
          <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"><i class="fas fa-times"></i></button>
        </div>
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-yellow-500"><i class="fas fa-crown text-3xl"></i></div>
          <div>
            <h3 class="text-xl font-bold">{{ t('loyalty.title') }}</h3>
            <p class="opacity-90 text-sm">{{ t('loyalty.subtitle') }}</p>
          </div>
        </div>
        <div class="mt-6 flex items-baseline">
          <span class="text-4xl font-bold">{{ member.points }}</span>
          <span class="ml-2 text-sm opacity-80">{{ t('loyalty.available') }}</span>
        </div>
        <div class="mt-4">
          <div class="flex justify-between text-xs mb-1 opacity-90">
            <span>{{ t('loyalty.nextReward') }}</span><span>{{ nextLabel }}</span>
          </div>
          <div class="w-full bg-black/20 rounded-full h-2">
            <div class="h-2 rounded-full transition-all duration-500" :class="nextReward ? 'bg-yellow-400' : 'bg-green-400'" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="p-6 bg-gray-50 max-h-[50vh] overflow-y-auto">
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 shadow-sm">
          <h4 class="font-bold text-blue-800 text-sm mb-1 flex items-center"><i class="fas fa-info-circle mr-2"></i>{{ t('loyalty.howToEarn') }}</h4>
          <ul class="text-xs text-blue-700 space-y-1 ml-1">
            <li>💰 <span class="font-bold">{{ t('loyalty.rule1') }}</span></li>
            <li>🚀 {{ t('loyalty.rule2') }}</li>
            <li class="opacity-80 italic">{{ t('loyalty.rule3') }}</li>
            <li class="opacity-80 italic">*{{ t('loyalty.rule4') }}</li>
          </ul>
        </div>

        <h4 class="font-bold text-gray-700 my-4 flex items-center text-sm uppercase tracking-wide">
          <i class="fas fa-gift text-red-500 mr-2"></i>{{ t('loyalty.rewards') }}
        </h4>

        <div class="space-y-3">
          <div v-for="r in sortedRewards" :key="r.id" class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex justify-center items-center"><i class="fas fa-gift"></i></div>
              <div>
                <p class="font-bold text-sm">{{ rName(r) }}</p>
                <p class="text-xs" :class="member.points >= r.cost ? 'text-green-600' : 'text-gray-400'">{{ r.cost }} {{ t('loyalty.points') }}</p>
              </div>
            </div>
            <button
              @click="redeem(r)"
              :disabled="member.points < r.cost"
              class="px-3 py-2 rounded-lg font-bold text-xs"
              :class="member.points >= r.cost ? 'bg-green-500 text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400'"
            >
              {{ member.points >= r.cost ? t('loyalty.obtain') : t('loyalty.locked') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMenuStore } from '../../stores/menu';
import { useMemberStore } from '../../stores/member';
import { useCartStore } from '../../stores/cart';
import { localizedName } from '../../i18n';
import { toast } from '../../composables/toast';
import { confirmDialog } from '../../composables/confirm';

const emit = defineEmits(['close', 'logout']);
const { t } = useI18n();
const menu = useMenuStore();
const member = useMemberStore();
const cart = useCartStore();

const rName = (r) => localizedName(r);
const sortedRewards = computed(() => [...menu.rewards].sort((a, b) => a.cost - b.cost));
const nextReward = computed(() => sortedRewards.value.find((r) => r.cost > member.points));
const nextLabel = computed(() => (nextReward.value ? `${nextReward.value.cost} ${t('loyalty.points')}` : t('loyalty.maxLevel')));
const progress = computed(() => (nextReward.value ? Math.min((member.points / nextReward.value.cost) * 100, 100) : 100));

async function redeem(r) {
  const inCart = cart.pointsToSpend;
  if (member.points < r.cost + inCart) {
    toast(`${t('loyalty.notEnough')} — ${t('loyalty.notEnoughMsg')}`, 'error');
    return;
  }
  const ok = await confirmDialog({
    title: t('loyalty.redeemTitle'),
    message: t('loyalty.redeemConfirm', { cost: r.cost, name: rName(r) }),
    confirmText: t('loyalty.obtain'),
  });
  if (!ok) return;
  cart.addReward(r);
  toast(t('loyalty.redeemed'), 'success');
  emit('close');
}
</script>
