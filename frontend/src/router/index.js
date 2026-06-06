import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useConfigStore } from '../stores/config';
import { useInsightsAuthStore } from '../stores/insights';

// Customer pages are mobile-first; admin pages are tablet/desktop.
const routes = [
  { path: '/', name: 'index', component: () => import('../views/Index.vue') },
  { path: '/order', name: 'order', component: () => import('../views/Order.vue') },

  // Back-office
  { path: '/admin/login', name: 'login', component: () => import('../views/admin/Login.vue') },
  { path: '/admin/menu', name: 'menu', component: () => import('../views/admin/Menu.vue'), meta: { auth: true } },
  { path: '/admin/qrcodes', name: 'qrcodes', component: () => import('../views/admin/QrCodes.vue'), meta: { auth: true } },
  { path: '/admin/counter', name: 'counter', component: () => import('../views/admin/Counter.vue'), meta: { auth: true } },
  { path: '/admin/dashboard', name: 'dashboard', component: () => import('../views/admin/Dashboard.vue'), meta: { auth: true } },
  {
    path: '/admin/kds',
    name: 'kds',
    component: () => import('../views/admin/Kds.vue'),
    meta: { auth: true, requiresKds: true },
  },
  // Standalone sales/customer big-screen (separate login, NOT under /admin)
  { path: '/insights/login', name: 'insights-login', component: () => import('../views/insights/Login.vue') },
  { path: '/insights', name: 'insights', component: () => import('../views/insights/BigScreen.vue'), meta: { insights: true } },

  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  if (to.meta.auth) {
    const auth = useAuthStore();
    if (!auth.token) return { name: 'login', query: { redirect: to.fullPath } };
    if (!auth.admin) await auth.fetchMe();
    if (!auth.token) return { name: 'login' };
  }
  // KDS is an optional module — block the route when disabled in config.
  if (to.meta.requiresKds) {
    const cfg = useConfigStore();
    if (!cfg.loaded) await cfg.load();
    if (!cfg.kdsEnabled) return { name: 'counter' };
  }
  // Big-screen has its own auth realm.
  if (to.meta.insights) {
    const ins = useInsightsAuthStore();
    if (!ins.token) return { name: 'insights-login' };
  }
});
