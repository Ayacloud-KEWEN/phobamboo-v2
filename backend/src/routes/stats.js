import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/stats/summary — totals for dashboard cards (admin).
router.get('/summary', requireAuth, async (req, res) => {
  const [memberCount, paidOrders, memberAgg] = await Promise.all([
    prisma.member.count(),
    prisma.order.findMany({ where: { status: 'paid' }, select: { total: true, paymentMethod: true } }),
    prisma.member.aggregate({ _sum: { points: true } }),
  ]);
  const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const cashRevenue = paidOrders.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);
  const cardRevenue = paidOrders.filter((o) => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0);
  res.json({
    memberCount,
    paidOrderCount: paidOrders.length,
    revenue: Number(revenue.toFixed(2)),
    cashRevenue: Number(cashRevenue.toFixed(2)),
    cardRevenue: Number(cardRevenue.toFixed(2)),
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

function sinceDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - (Math.min(Number(days) || 30, 365)));
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/stats/top-products?days=30 — best-selling dishes (admin).
router.get('/top-products', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: 'paid', createdAt: { gte: sinceDays(req.query.days) } },
    select: { items: true },
  });
  const map = {};
  for (const o of orders) {
    for (const it of Array.isArray(o.items) ? o.items : []) {
      if (it.pointsCost || String(it.name).startsWith('🎁')) continue; // skip reward gifts
      const key = it.name;
      if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0 };
      map[key].qty += it.quantity;
      map[key].revenue += (it.price || 0) * it.quantity;
    }
  }
  const top = Object.values(map)
    .map((d) => ({ ...d, revenue: Number(d.revenue.toFixed(2)) }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 20);
  res.json(top);
});

// GET /api/stats/export?days=30 — CSV of paid orders (admin).
router.get('/export', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: 'paid', createdAt: { gte: sinceDays(req.query.days) } },
    orderBy: { paidAt: 'asc' },
  });
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const methodLabel = { cash: 'Espèces', card: 'Carte' };
  const head = ['Date', 'N°', 'Table', 'Téléphone', 'Paiement', 'Total', 'Points', 'Articles'];
  const rows = orders.map((o) => {
    const items = (Array.isArray(o.items) ? o.items : []).map((i) => `${i.quantity}x ${i.name}`).join(' | ');
    return [
      o.paidAt ? new Date(o.paidAt).toLocaleString('fr-FR') : '',
      o.dailyNumber || '',
      o.table || '',
      o.phone || '',
      methodLabel[o.paymentMethod] || '',
      o.total.toFixed(2),
      o.pointsAwarded || 0,
      items,
    ].map(esc).join(',');
  });
  const csv = '﻿' + [head.map(esc).join(','), ...rows].join('\r\n'); // BOM for Excel
  res.header('Content-Type', 'text/csv; charset=utf-8');
  res.header('Content-Disposition', `attachment; filename="phobamboo_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

export default router;
