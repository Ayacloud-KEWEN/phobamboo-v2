<template>
  <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
      <div class="bamboo-gradient text-white p-5 flex justify-between items-center">
        <h3 class="text-xl font-bold flex items-center"><i class="fas fa-info-circle mr-2"></i>{{ cfg.name }}</h3>
        <button @click="$emit('close')" class="bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center"><i class="fas fa-times"></i></button>
      </div>
      <div class="p-6 space-y-5">
        <div>
          <h4 class="font-bold text-gray-800 flex items-center mb-1"><i class="fas fa-map-marker-alt text-green-600 w-5 text-center mr-2"></i>{{ t('infos.findUs') }}</h4>
          <p class="text-sm text-gray-600 pl-7 leading-relaxed">
            Galerie commerciale de la Gare RER La Défense, Parv. de l'arche<br />
            <span class="font-medium text-gray-800">92800 Puteaux</span>
          </p>
        </div>
        <div>
          <h4 class="font-bold text-gray-800 flex items-center mb-2"><i class="fas fa-clock text-green-600 w-5 text-center mr-2"></i>{{ t('infos.hours') }}</h4>
          <div class="text-sm text-gray-600 pl-7 space-y-1">
            <p class="flex justify-between border-b border-gray-100 pb-1"><span>Lundi - Samedi</span><span class="font-bold text-gray-800">11:00 - 21:00</span></p>
            <p class="flex justify-between text-red-500 pt-1"><span>Dimanche</span><span class="font-bold">Fermé</span></p>
          </div>
        </div>
        <div>
          <h4 class="font-bold text-gray-800 flex items-center mb-1"><i class="fas fa-phone-alt text-green-600 w-5 text-center mr-2"></i>{{ t('infos.contact') }}</h4>
          <a href="tel:0760736465" class="text-lg font-black text-green-700 pl-7 tracking-wide block">07 60 73 64 65</a>
          <p class="text-xs text-amber-600 pl-7 italic mt-1 font-medium"><i class="fas fa-bell mr-1"></i>{{ t('infos.reserveNote') }}</p>
        </div>
        <div class="bg-gray-50 border border-gray-100 p-3 rounded-lg text-center">
          <p class="text-xs text-gray-400">{{ t('infos.scanToOrder') }}</p>
        </div>
        <button @click="$emit('close')" class="w-full bamboo-gradient text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition">{{ t('common.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useConfigStore } from '../../stores/config';
defineEmits(['close']);
const { t } = useI18n();
const cfg = useConfigStore();
</script>
