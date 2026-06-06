import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Default restaurant config (id is fixed to 1 — the single config row).
  await prisma.restaurantConfig.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  // Default owner account. Boss wants it simple/memorable — override via .env.
  const username = process.env.SEED_ADMIN_USER || 'admin';
  const password = process.env.SEED_ADMIN_PASS || 'phobamboo';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    create: { username, passwordHash, role: 'owner' },
    update: { passwordHash, role: 'owner' },
  });

  // Separate read-only "viewer" account for the sales/customer big-screen (/insights).
  const vUser = process.env.SEED_VIEWER_USER || 'patron';
  const vPass = process.env.SEED_VIEWER_PASS || 'patron';
  const vHash = await bcrypt.hash(vPass, 10);
  await prisma.adminUser.upsert({
    where: { username: vUser },
    create: { username: vUser, passwordHash: vHash, role: 'viewer' },
    update: { passwordHash: vHash, role: 'viewer' },
  });

  console.log(`✅ Seed done.`);
  console.log(`   Admin (back-office) : ${username} / ${password}`);
  console.log(`   Viewer (grand écran): ${vUser} / ${vPass}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
