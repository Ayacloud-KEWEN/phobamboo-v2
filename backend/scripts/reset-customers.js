// Wipe customer + transaction data before going live, KEEPING the menu,
// rewards, restaurant config and admin accounts.
//
// Deletes: Order, Member.   Keeps: Product, Reward, RestaurantConfig, AdminUser.
//
// SAFETY: dry-run by default. Re-run with --yes (or CONFIRM=yes) to delete.
//   cd /home/app/backend
//   node scripts/reset-customers.js          # aperçu (ne supprime rien)
//   node scripts/reset-customers.js --yes     # supprime réellement
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const confirm = process.argv.includes('--yes') || process.env.CONFIRM === 'yes';

const [orders, members, products, rewards] = await Promise.all([
  prisma.order.count(),
  prisma.member.count(),
  prisma.product.count(),
  prisma.reward.count(),
]);

console.log('--- État actuel ---');
console.log(`Commandes (à supprimer) : ${orders}`);
console.log(`Membres   (à supprimer) : ${members}`);
console.log(`Plats     (conservés)   : ${products}`);
console.log(`Récompenses (conservées): ${rewards}`);

if (!confirm) {
  console.log('\nAperçu uniquement. Relancez avec --yes pour supprimer commandes + membres.');
  await prisma.$disconnect();
  process.exit(0);
}

await prisma.order.deleteMany({});
await prisma.member.deleteMany({});

console.log('\n✅ Supprimé : toutes les commandes et tous les membres.');
console.log('   Conservés : plats, récompenses, configuration, comptes admin.');
console.log('   Les numéros de commande repartiront à #1 aujourd’hui.');
await prisma.$disconnect();
