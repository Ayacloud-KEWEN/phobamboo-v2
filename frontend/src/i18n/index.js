import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';
import en from './locales/en.json';
import zh from './locales/zh.json';

// Each locale carries a flag emoji for the dropdown switcher.
export const LOCALES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const saved = localStorage.getItem('pb_locale');

export const i18n = createI18n({
  legacy: false,
  locale: saved || 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en, zh },
});

export function setLocale(code) {
  i18n.global.locale.value = code;
  localStorage.setItem('pb_locale', code);
  document.documentElement.lang = code;
}

// Pick the right localized product/reward name with graceful fallback.
export function localizedName(item) {
  const code = i18n.global.locale.value;
  const map = { fr: item?.nameFr, en: item?.nameEn, zh: item?.nameZh };
  return map[code] || item?.nameFr || item?.nameEn || item?.nameZh || '';
}
