<template>
  <transition enter-active-class="transition" enter-from-class="opacity-0" leave-active-class="transition" leave-to-class="opacity-0">
    <div v-if="s.open" class="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="cancel">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="h-2 w-full" :class="s.danger ? 'bg-red-500' : 'bamboo-gradient'"></div>
        <div class="p-6 text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" :class="s.danger ? 'bg-red-100' : 'bg-bamboo-accent/40'">
            <i class="fas text-2xl" :class="s.danger ? 'fa-triangle-exclamation text-red-500' : 'fa-circle-question bamboo-text'"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-1">{{ s.title || t('common.confirm') }}</h3>
          <p v-if="s.message" class="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{{ s.message }}</p>
        </div>
        <div class="px-6 pb-6 flex gap-3">
          <button @click="cancel" class="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition">
            {{ s.cancelText || t('common.cancel') }}
          </button>
          <button
            @click="ok"
            class="flex-1 py-3 rounded-xl text-white font-bold transition active:scale-95"
            :class="s.danger ? 'bg-red-600 hover:bg-red-500' : 'bamboo-gradient hover:opacity-90'"
          >
            {{ s.confirmText || t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { confirmState as s, settleConfirm } from '../composables/confirm';

const { t } = useI18n();
const ok = () => settleConfirm(true);
const cancel = () => settleConfirm(false);
</script>
