# PhoBamboo Frontend (v2)

Vue 3 + Vite + Pinia + Vue Router + vue-i18n + Tailwind. Replaces the old static
HTML pages. Mobile-first for customers, tablet/desktop for back-office.

## Run
```bash
cp .env.example .env   # leave VITE_API_URL empty for dev
npm install
npm run dev            # http://localhost:5173  (proxies /api -> :4000)
npm run build          # production build -> dist/
```
Backend must be running on :4000 (see ../backend).

## Routes
| Path | Page | Device | Auth |
|---|---|---|---|
| `/` | Index (menu browse) | mobile | – |
| `/order?table=N` | Order (QR ordering + loyalty) | mobile | – |
| `/admin/login` | Admin login | any | – |
| `/admin/menu` | Menu CRUD | phone/desktop | ✓ |
| `/admin/counter` | Order confirmation + points | tablet | ✓ |
| `/admin/dashboard` | Stats | tablet | ✓ |
| `/admin/kds` | Kitchen display (optional module) | tablet | ✓ + config.kdsEnabled |

## i18n (中 / 英 / 法)
- Locale files: `src/i18n/locales/{fr,en,zh}.json`
- Flag dropdown: `src/components/LanguageSwitcher.vue`
- Product/reward names are stored per-language (nameFr/nameEn/nameZh); `localizedName()`
  picks the active locale with fallback.

## Reusing for another restaurant
Almost everything is data-driven from `RestaurantConfig` (name, logo, color, default
locale, currency, pointsPerEuro, kdsEnabled). To reskin further:
- `src/theme/theme.css` — brand CSS vars (also overridden at runtime by config.primaryColor)
- `tailwind.config.js` — `bamboo` color palette
- `src/components/CustomerFooter.vue` — address / hours / contact

## Status
- ✅ Skeleton, theme, i18n, stores, routing
- ✅ Index + Order (full ordering + loyalty)
- ⏳ Admin Menu / Counter / Dashboard / KDS are stubs (next phases)
