import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { emitMemberUpdate } from '../lib/realtime.js';

const router = Router();

// GET /api/members/:phone — customer checks own points (public) or counter lookup.
router.get('/:phone', async (req, res) => {
  const member = await prisma.member.findUnique({ where: { phone: req.params.phone } });
  if (!member) return res.status(404).json({ error: 'Not found' });
  res.json(member);
});

// POST /api/members — create/ensure a member exists (customer login, public).
router.post('/', async (req, res) => {
  const phone = String(req.body.phone || '');
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  const member = await prisma.member.upsert({
    where: { phone },
    create: { phone, acceptsSMS: !!req.body.acceptsSMS },
    update: req.body.acceptsSMS === undefined ? {} : { acceptsSMS: !!req.body.acceptsSMS },
  });
  res.json(member);
});

// GET /api/members — list all (admin, for dashboard).
router.get('/', requireAuth, async (req, res) => {
  const members = await prisma.member.findMany({ orderBy: { points: 'desc' } });
  res.json(members);
});

// PATCH /api/members/:phone/points — counter manually adjusts points (admin).
// Body: { delta } to add/subtract, or { set } to set absolute value.
router.patch('/:phone/points', requireAuth, async (req, res) => {
  const { delta, set } = req.body || {};
  const data =
    set !== undefined
      ? { points: Math.max(0, Number(set) || 0) }
      : { points: { increment: Number(delta) || 0 } };

  const member = await prisma.member.upsert({
    where: { phone: req.params.phone },
    create: { phone: req.params.phone, points: Math.max(0, Number(set ?? delta) || 0) },
    update: data,
  });
  emitMemberUpdate(member);
  res.json(member);
});

export default router;
