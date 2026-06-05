import { defineStore } from 'pinia';
import api from '../api/client';
import { setLocale } from '../i18n';

// Restaurant-wide config (name, logo, colors, locale, kdsEnabled, pointsPerEuro).
export const useConfigStore = defineStore('config', {
  state: () => ({
    loaded: false,
    name: 'Pho Bamboo',
    logo: '/logo.png',
    primaryColor: '#2d5a27',
    defaultLocale: 'fr',
    currency: 'EUR',
    pointsPerEuro: 1,
    pointsThreshold: 20,
    comboPrice: 3.8,
    kdsEnabled: false,
    whatsapp: '',
  }),
  actions: {
    async load() {
      try {
        const { data } = await api.get('/api/config');
        Object.assign(this, data);
        this.loaded = true;
        // Apply brand color at runtime so reskinning needs no rebuild.
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--bamboo-primary', data.primaryColor);
        }
        // Respect default locale only if user hasn't chosen one yet.
        if (!localStorage.getItem('pb_locale') && data.defaultLocale) {
          setLocale(data.defaultLocale);
        }
      } catch (e) {
        console.warn('Config load failed, using defaults', e);
      }
    },
  },
});
