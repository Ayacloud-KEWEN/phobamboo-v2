import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { emitOrderNew, emitOrderUpdate, emitMemberUpdate } from '../lib/realtime.js';

const router = Router();

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// POST /api/orders — customer places an order (public).
// If member spends points, deduct them atomically here.
router.post('/', async (req, res) => {
  const b = req.body || {};
  const phone = b.phone ? String(b.phone) : '';
  const items = Array.isArray(b.items) ? b.items : [];
  const total = Number(b.total) || 0;
  const pointsToEarn = Number(b.pointsToEarn) || 0;
  const pointsSpent = Number(b.pointsSpent) || 0;

  try {
    const order = await prisma.$transaction(async (tx) => {
      if (phone && pointsSpent > 0) {
        const member = await tx.member.findUnique({ where: { phone } });
        if (!member || member.points < pointsSpent) {
          throw new Error('INSUFFICIENT_POINTS');
        }
        await tx.member.update({
          where: { phone },
          data: { points: { decrement: pointsSpent } },
        });
      }
      return tx.order.create({
        data: {
          table: String(b.table ?? ''),
          phone,
          items,
          total,
          notes: String(b.notes ?? ''),
          status: 'pending',
          pointsToEarn,
          pointsSpent,
        },
      });
    });

    emitOrderNew(order);
    res.status(201).json(order);
  } catch (e) {
    if (e.message === 'INSUFFICIENT_POINTS') {
      return res.status(400).json({ error: 'INSUFFICIENT_POINTS' });
    }
    console.error('Create order error:', e);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders — counter/kds/dashboard (admin). Filters: status, today, phone.
router.get('/', requireAuth, async (req, res) => {
  const where = {};
  const { status, today, phone } = req.query;
  if (status) where.status = { in: String(status).split(',') };
  if (today === 'true') where.createdAt = { gte: startOfToday() };
  if (phone) where.phone = String(phone);
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

// PATCH /api/orders/:id/status — move pending->completed, etc. (admin)
router.patch('/:id/status', requireAuth, async (req, res) => {
  const status = String(req.body.status || '');
  const allowed = ['pending', 'completed', 'paid', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Bad status' });

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status, ...(status === 'paid' ? { paidAt: new Date() } : {}) },
  });
  emitOrderUpdate(order);
  res.json(order);
});

// POST /api/orders/:id/pay — counter confirms payment, credit loyalty points (admin).
//
// Loyalty rule (config-driven, ported from the original counter):
//   - Points accrue on the member's *cumulative same-day spend*, not per order.
//   - No points until daily total reaches `pointsThreshold` (default 20€).
//   - Once reached, target points = floor(dailyTotal * pointsPerEuro).
//   - This order awards the difference vs. what earlier same-day paid orders
//     already granted (tracked via Order.pointsAwarded), never negative.
router.post('/:id/pay', requireAuth, async (req, res) => {
  try {
    const { order, member } = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new Error('NOT_FOUND');
      if (existing.status === 'paid') throw new Error('ALREADY_PAID');

      const cfg = await tx.restaurantConfig.findUnique({ where: { id: 1 } });
      const threshold = cfg?.pointsThreshold ?? 20;
      const rate = cfg?.pointsPerEuro ?? 1;

      let pointsToAdd = 0;
      if (existing.phone) {
        // Sum earlier same-day paid orders for this member.
        const sod = startOfToday();
        const prior = await tx.order.findMany({
          where: { phone: existing.phone, status: 'paid', paidAt: { gte: sod } },
          select: { total: true, pointsAwarded: true },
        });
        const pastTotal = prior.reduce((s, o) => s + o.total, 0);
        const pastPoints = prior.reduce((s, o) => s + o.pointsAwarded, 0);
        const grandTotal = pastTotal + existing.total;
        const target = grandTotal < threshold ? 0 : Math.floor(grandTotal * rate);
        pointsToAdd = Math.max(0, target - pastPoints);
      }

      const order = await tx.order.update({
        where: { id: req.params.id },
        data: { status: 'paid', paidAt: new Date(), pointsAwarded: pointsToAdd },
      });

      let member = null;
      if (order.phone && pointsToAdd > 0) {
        member = await tx.member.upsert({
          where: { phone: order.phone },
          create: { phone: order.phone, points: pointsToAdd },
          update: { points: { increment: pointsToAdd } },
        });
      } else if (order.phone) {
        // Still return current member balance for the counter toast.
        member = await tx.member.findUnique({ where: { phone: order.phone } });
      }
      return { order, member };
    });

    emitOrderUpdate(order);
    if (member) emitMemberUpdate(member);
    res.json({ order, member });
  } catch (e) {
    if (e.message === 'NOT_FOUND') return res.status(404).json({ error: 'Order not found' });
    if (e.message === 'ALREADY_PAID') return res.status(409).json({ error: 'Already paid' });
    console.error('Pay order error:', e);
    res.status(500).json({ error: 'Failed to pay order' });
  }
});

export default router;
