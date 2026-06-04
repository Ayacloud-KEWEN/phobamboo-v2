import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/stats/summary — totals for dashboard cards (admin).
router.get('/summary', requireAuth, async (req, res) => {
  const [memberCount, paidOrders, memberAgg] = await Promise.all([
    prisma.member.count(),
    prisma.order.findMany({ where: { status: 'paid' }, select: { total: true } }),
    prisma.member.aggregate({ _sum: { points: true } }),
  ]);
  const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
  res.json({
    memberCount,
    paidOrderCount: paidOrders.length,
    revenue: Number(revenue.toFixed(2)),
    totalPoints: memberAgg._sum.points || 0,
  });
});

// GET /api/stats/daily?days=30 — revenue + order count grouped by day (admin).
router.get('/daily', requireAuth, async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { status: 'paid', createdAt: { gte: since } },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const byDay = {};
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = { date: key, revenue: 0, count: 0 };
    byDay[key].revenue += o.total;
    byDay[key].count += 1;
  }
  res.json(Object.values(byDay).map((d) => ({ ...d, revenue: Number(d.revenue.toFixed(2)) })));
});

export default router;
