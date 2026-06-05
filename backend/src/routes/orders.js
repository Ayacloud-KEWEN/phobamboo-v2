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
//
// SECURITY: prices, total and points are recomputed server-side from the
// product/reward catalog. The client only sends *what* was ordered (ids +
// quantities), never amounts — so totals/points can't be tampered with.
//
// Body: { table, phone, notes, lines: [
//   { kind: 'product', productId, comboEntreeId?, quantity },
//   { kind: 'reward',  rewardId, quantity }
// ] }
const pickName = (o) => o?.nameFr || o?.nameEn || o?.nameZh || '';

router.post('/', async (req, res) => {
  const b = req.body || {};
  const phone = b.phone ? String(b.phone) : '';
  const lines = Array.isArray(b.lines) ? b.lines : [];
  if (!lines.length) return res.status(400).json({ error: 'EMPTY_ORDER' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cfg = await tx.restaurantConfig.findUnique({ where: { id: 1 } });
      const comboPrice = cfg?.comboPrice ?? 3.8;
      const threshold = cfg?.pointsThreshold ?? 20;
      const rate = cfg?.pointsPerEuro ?? 1;

      const items = [];
      let total = 0;
      let pointsSpent = 0;

      for (const line of lines) {
        const qty = Math.max(1, parseInt(line.quantity) || 1);

        if (line.kind === 'reward') {
          const reward = await tx.reward.findUnique({ where: { id: String(line.rewardId) } });
          if (!reward || !reward.active) throw new Error('INVALID_REWARD');
          pointsSpent += reward.cost * qty;
          items.push({ name: `🎁 ${pickName(reward)}`, quantity: qty, price: 0, pointsCost: reward.cost });
          continue;
        }

        const product = await tx.product.findUnique({ where: { id: String(line.productId) } });
        if (!product || !product.available) throw new Error('INVALID_PRODUCT');

        let price = product.price;
        let name = pickName(product);
        if (line.comboEntreeId) {
          const opts = Array.isArray(product.comboOptions) ? product.comboOptions.map(String) : [];
          if (!opts.includes(String(line.comboEntreeId))) throw new Error('INVALID_COMBO');
          const entree = await tx.product.findUnique({ where: { id: String(line.comboEntreeId) } });
          if (!entree) throw new Error('INVALID_COMBO');
          price += comboPrice;
          name += ` (+ ${pickName(entree)})`;
        }
        price = Number(price.toFixed(2));
        total += price * qty;
        items.push({ name, quantity: qty, price });
      }

      total = Number(total.toFixed(2));
      const pointsToEarn = total < threshold ? 0 : Math.floor(total * rate);

      // Deduct spent points atomically (members only).
      if (pointsSpent > 0) {
        if (!phone) throw new Error('LOGIN_REQUIRED');
        const member = await tx.member.findUnique({ where: { phone } });
        if (!member || member.points < pointsSpent) throw new Error('INSUFFICIENT_POINTS');
        await tx.member.update({ where: { phone }, data: { points: { decrement: pointsSpent } } });
      }

      // Per-day sequence number.
      const todayCount = await tx.order.count({ where: { createdAt: { gte: startOfToday() } } });

      return tx.order.create({
        data: {
          dailyNumber: todayCount + 1,
          table: String(b.table ?? ''),
          phone,
          items,
          total,
          notes: String(b.notes ?? ''),
          status: 'pending',
          pointsToEarn: phone ? pointsToEarn : 0,
          pointsSpent,
        },
      });
    });

    emitOrderNew(result);
    res.status(201).json(result);
  } catch (e) {
    const known = ['INSUFFICIENT_POINTS', 'INVALID_PRODUCT', 'INVALID_REWARD', 'INVALID_COMBO', 'LOGIN_REQUIRED', 'EMPTY_ORDER'];
    if (known.includes(e.message)) return res.status(400).json({ error: e.message });
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
  const method = ['cash', 'card'].includes(req.body.method) ? req.body.method : '';
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
        data: { status: 'paid', paidAt: new Date(), pointsAwarded: pointsToAdd, paymentMethod: method },
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

// POST /api/orders/:id/refund — reverse a paid order (admin).
// Removes the points it earned and gives back any points spent on it.
router.post('/:id/refund', requireAuth, async (req, res) => {
  try {
    const { order, member } = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new Error('NOT_FOUND');
      if (existing.status !== 'paid') throw new Error('NOT_REFUNDABLE');

      const order = await tx.order.update({
        where: { id: req.params.id },
        data: { status: 'refunded', refundedAt: new Date() },
      });

      let member = null;
      if (existing.phone) {
        const delta = (existing.pointsSpent || 0) - (existing.pointsAwarded || 0);
        member = await tx.member.findUnique({ where: { phone: existing.phone } });
        if (member) {
          const newPoints = Math.max(0, member.points + delta);
          member = await tx.member.update({ where: { phone: existing.phone }, data: { points: newPoints } });
        }
      }
      return { order, member };
    });

    emitOrderUpdate(order);
    if (member) emitMemberUpdate(member);
    res.json({ order, member });
  } catch (e) {
    if (e.message === 'NOT_FOUND') return res.status(404).json({ error: 'Order not found' });
    if (e.message === 'NOT_REFUNDABLE') return res.status(409).json({ error: 'Order is not paid' });
    console.error('Refund error:', e);
    res.status(500).json({ error: 'Failed to refund' });
  }
});

export default router;
