// Dump products (id + names) to JSON so existing dishes can be translated.
// Usage on the VPS:
//   cd /home/app/backend && node scripts/dump-products.js > products.json
// Then send products.json (or paste its content).
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const rows = await prisma.product.findMany({
  select: { id: true, category: true, nameFr: true, nameEn: true, nameZh: true },
  orderBy: [{ category: 'asc' }, { nameFr: 'asc' }],
});
process.stdout.write(JSON.stringify(rows, null, 2));
await prisma.$disconnect();
