/**
 * One-time migration: Firebase Firestore -> PostgreSQL.
 *
 * Usage:
 *   1. Download a Firebase service account key JSON from the Firebase console
 *      (Project settings > Service accounts > Generate new private key).
 *   2. Point FIREBASE_SERVICE_ACCOUNT in .env at that file.
 *   3. Run migrations + seed first, then: npm run migrate:firebase
 *
 * Notes:
 *   - Old menu used name_fr / name_vn. We map name_fr -> nameFr and leave
 *     nameZh / nameEn empty for later translation (Vietnamese is dropped).
 *   - Firestore Users (doc id = phone) -> Member.
 */
import 'dotenv/config';
import fs from 'node:fs';
import admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';
if (!fs.existsSync(keyPath)) {
  console.error(`Service account key not found at ${keyPath}. See .env FIREBASE_SERVICE_ACCOUNT.`);
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(keyPath, 'utf8'))) });
const fdb = admin.firestore();

const toDate = (ts) => (ts && typeof ts.toDate === 'function' ? ts.toDate() : ts ? new Date(ts) : null);

async function migrateProducts() {
  const snap = await fdb.collection('Products').get();
  let n = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    await prisma.product.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        nameZh: '',
        nameEn: '',
        nameFr: d.name_fr || d.name || '',
        price: Number(d.price) || 0,
        category: d.category || '',
        subCategory: d.sub_category || '',
        description: d.description || '',
        image: d.image || '',
        popular: !!d.popular,
        spicy: !!d.spicy,
        vegan: !!d.vegan,
        available: d.available !== false,
        comboOptions: Array.isArray(d.combo_options) ? d.combo_options : [],
      },
      update: {},
    });
    n++;
  }
  console.log(`Products: ${n}`);
}

async function migrateRewards() {
  const snap = await fdb.collection('Rewards').get();
  let n = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    await prisma.reward.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        nameZh: '',
        nameEn: '',
        nameFr: d.name_fr || d.name || '',
        cost: Number(d.cost) || 0,
        image: d.image || '',
        active: d.active !== false,
      },
      update: {},
    });
    n++;
  }
  console.log(`Rewards: ${n}`);
}

async function migrateMembers() {
  const snap = await fdb.collection('Users').get();
  let n = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const phone = doc.id;
    if (!phone) continue;
    await prisma.member.upsert({
      where: { phone },
      create: {
        phone,
        points: Number(d.points) || 0,
        acceptsSMS: !!d.acceptsSMS,
        createdAt: toDate(d.createdAt) || new Date(),
      },
      update: { points: Number(d.points) || 0, acceptsSMS: !!d.acceptsSMS },
    });
    n++;
  }
  console.log(`Members: ${n}`);
}

async function migrateOrders() {
  const snap = await fdb.collection('Orders').get();
  let n = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const status = ['pending', 'completed', 'paid', 'cancelled'].includes(d.status) ? d.status : 'pending';
    await prisma.order.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        table: String(d.table ?? ''),
        phone: d.phone && d.phone !== 'Non renseigné' ? String(d.phone) : '',
        items: Array.isArray(d.items) ? d.items : [],
        total: Number(d.total) || 0,
        notes: d.notes || '',
        status,
        pointsToEarn: Number(d.pointsToEarn) || 0,
        pointsAwarded: Number(d.pointsAwarded) || 0,
        createdAt: toDate(d.createdAt) || new Date(),
        paidAt: toDate(d.paidAt),
      },
      update: {},
    });
    n++;
  }
  console.log(`Orders: ${n}`);
}

async function main() {
  console.log('Migrating Firestore -> PostgreSQL...');
  await migrateProducts();
  await migrateRewards();
  await migrateMembers();
  // Orders reference members via phone; members are migrated first.
  await migrateOrders();
  console.log('✅ Migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
