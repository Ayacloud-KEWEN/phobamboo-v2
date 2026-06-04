<template>
  <footer class="bg-gray-800 text-white mt-auto">
    <div class="h-2 bamboo-gradient"></div>
    <div class="container mx-auto px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 class="text-lg font-bold mb-4 text-green-400 uppercase tracking-wider">{{ t('nav.infos') }}</h3>
          <p class="mb-2">
            <i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>
            Galerie commerciale de la Gare RER La Défense, Parv. de l'arche
          </p>
          <p class="mb-4 text-gray-400 ml-6">92800 Puteaux</p>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-4 text-green-400 uppercase tracking-wider">Horaires</h3>
          <ul class="space-y-2 text-sm text-gray-300">
            <li class="flex justify-between md:justify-start gap-4"><span class="w-24">Lun - Sam</span><span class="text-white">11:00 - 21:00</span></li>
            <li class="flex justify-between md:justify-start gap-4 text-red-300"><span class="w-24">Dimanche</span><span>Fermé</span></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-bold mb-4 text-green-400 uppercase tracking-wider">Contact</h3>
          <p class="mb-2"><i class="fas fa-phone mr-2 text-gray-400"></i> 07 60 73 64 65</p>
        </div>
      </div>
      <div class="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-500">
        © {{ year }} {{ cfg.name }}. Tous droits réservés.
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
