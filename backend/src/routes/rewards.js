import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/rewards (public)
router.get('/', async (req, res) => {
  const where = {};
  if (req.query.active === 'true') where.active = true;
  const rewards = await prisma.reward.findMany({ where, orderBy: { cost: 'asc' } });
  res.json(rewards);
});

router.post('/', requireAuth, async (req, res) => {
  const reward = await prisma.reward.create({ data: sanitize(req.body) });
  res.status(201).json(reward);
});

router.put('/:id', requireAuth, async (req, res) => {
  const reward = await prisma.reward.update({
    where: { id: req.params.id },
    data: sanitize(req.body),
  });
  res.json(reward);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await prisma.reward.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

function sanitize(b = {}) {
  return {
    nameZh: String(b.nameZh ?? ''),
    nameEn: String(b.nameEn ?? ''),
    nameFr: String(b.nameFr ?? ''),
    cost: Number(b.cost) || 0,
    image: String(b.image ?? ''),
    active: b.active === undefined ? true : !!b.active,
  };
}

export default router;
