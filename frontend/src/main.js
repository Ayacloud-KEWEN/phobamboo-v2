import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './theme/theme.css';
import App from './App.vue';
import { router } from './router';
import { i18n } from './i18n';
import { useConfigStore } from './stores/config';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);

// Load restaurant config before mount so colors/locale are applied early.
useConfigStore()
  .load()
  .finally(() => app.mount('#app'));
