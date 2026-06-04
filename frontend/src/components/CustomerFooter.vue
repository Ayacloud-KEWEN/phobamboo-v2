<template>
  <footer id="infos" class="bg-gray-800 text-white mt-auto">
    <div class="h-2 bamboo-gradient"></div>
    <div class="container mx-auto px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 class="text-lg font-bold mb-4 text-green-400 uppercase tracking-wider">{{ t('infos.findUs') }}</h3>
          <p class="mb-2">
            <i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>
            Galerie commerciale de la Gare RER La Défense, Parv. de l'arche
          </p>
          <p class="mb-4 text-gray-400 ml-6">92800 Puteaux</p>
          <a
            href="https://maps.google.com/?q=Pho+Bamboo+Puteaux"
            target="_blank"
            class="inline-block border border-gray-600 text-sm px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            <i class="fas fa-location-arrow mr-2"></i>{{ t('infos.viewMap') }}
          </a>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-4 text-green-400 uppercase tracking-wider">{{ t('infos.hours') }}</h3>
          <ul class="space-y-2 text-sm text-gray-300">
            <li class="flex justify-between md:justify-start gap-4"><span class="w-28">{{ t('infos.monSat') }}</span><span class="text-white">11:00 - 21:00</span></li>
            <li class="flex justify-between md:justify-start gap-4 text-red-300"><span class="w-28">{{ t('infos.sunday') }}</span><span>{{ t('infos.closed') }}</span></li>
          </ul>
          <p class="mt-3 text-xs text-amber-300/90 italic"><i class="fas fa-utensils mr-1"></i>{{ t('infos.serviceMin') }}</p>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-4 text-green-400 uppercase tracking-wider">{{ t('infos.contact') }}</h3>
          <p class="mb-2"><i class="fas fa-phone mr-2 text-gray-400"></i> 07 60 73 64 65</p>
          <p class="mb-4 text-sm text-gray-400">{{ t('infos.reserveNote') }}</p>
        </div>
      </div>
      <div class="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-500">
        © {{ year }} {{ cfg.name }}. {{ t('infos.rights') }}
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useConfigStore } from '../stores/config';

const { t } = useI18n();
const cfg = useConfigStore();
const year = new Date().getFullYear();
</script>
