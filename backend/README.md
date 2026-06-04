# PhoBamboo Backend (v2)

Express + Prisma + PostgreSQL + Socket.IO. Replaces the old Firebase/Firestore
setup. Designed to be reusable: per-restaurant content lives in `RestaurantConfig`.

## Stack
- **Express** REST API (`/api/*`)
- **Prisma** ORM over **PostgreSQL**
- **Socket.IO** for realtime order push to counter / KDS
- **multer** image upload to local disk (`/uploads`)
- **JWT** admin auth (bcrypt password hashing)

## Setup (local or VPS)

```bash
cp .env.example .env        # then edit DATABASE_URL, JWT_SECRET, admin creds
npm install
npx prisma migrate deploy   # or: npx prisma migrate dev  (creates tables)
npm run seed                # creates default config + admin account
npm run dev                 # http://localhost:4000
```

Default admin (change in `.env` `SEED_ADMIN_*`): **admin / phobamboo**

## Migrate existing Firebase data (one-time)
1. Firebase console → Project settings → Service accounts → Generate new private key.
2. Save the JSON, set `FIREBASE_SERVICE_ACCOUNT` in `.env` to its path.
3. Run table creation + seed first, then:
   ```bash
   npm run migrate:firebase
   ```
   Maps `Products`→Product (name_fr→nameFr; zh/en left blank to translate later),
   `Rewards`→Reward, `Users`→Member, `Orders`→Order.

## API overview
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/login | – | Admin login → JWT |
| GET | /api/config | – | Restaurant config (name, logo, locale, kdsEnabled) |
| PUT | /api/config | owner | Update config / toggle KDS |
| GET | /api/products?available=true | – | Menu for customers |
| POST/PUT/DELETE | /api/products | admin | Menu CRUD |
| GET | /api/rewards | – | Loyalty rewards |
| POST | /api/orders | – | Customer places order (deducts spent points) |
| GET | /api/orders?status=&today=&phone= | admin | Counter/KDS/dashboard list |
| PATCH | /api/orders/:id/status | admin | Change status |
| POST | /api/orders/:id/pay | admin | Confirm payment → credit loyalty points |
| GET | /api/members/:phone | – | Member points lookup |
| PATCH | /api/members/:phone/points | admin | Adjust points (delta or set) |
| POST | /api/upload | admin | Image upload → { url } |
| GET | /api/stats/summary, /api/stats/daily | admin | Dashboard stats |

## Realtime
Frontend connects via Socket.IO and emits `join` with `"counter"` or `"kds"`.
Server pushes `order:new`, `order:update`, `member:update`.

## Order lifecycle
`pending` (sent to counter) → `completed` (ready) → `paid` (points credited).
