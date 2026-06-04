import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireOwner } from '../middleware/auth.js';

const router = Router();

async function getConfig() {
  return prisma.restaurantConfig.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
}

// GET /api/config — public (frontend needs name, logo, locale, kdsEnabled, etc.)
router.get('/', async (req, res) => {
  res.json(await getConfig());
});

// PUT /api/config — owner only (includes the KDS on/off switch).
router.put('/', requireAuth, requireOwner, async (req, res) => {
  const b = req.body || {};
  const data = {};
  for (const k of [
    'name', 'logo', 'primaryColor', 'defaultLocale',
    'currency', 'whatsapp',
  ]) {
    if (b[k] !== undefined) data[k] = String(b[k]);
  }
  if (b.pointsPerEuro !== undefined) data.pointsPerEuro = Number(b.pointsPerEuro) || 0;
  if (b.pointsThreshold !== undefined) data.pointsThreshold = Number(b.pointsThreshold) || 0;
  if (b.kdsEnabled !== undefined) data.kdsEnabled = !!b.kdsEnabled;

  const config = await prisma.restaurantConfig.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });
  res.json(config);
});

export default router;
