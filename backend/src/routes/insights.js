import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signInsightsToken, requireInsights } from '../middleware/auth.js';

const router = Router();

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function sinceDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - (Math.min(Number(days) || 30, 365)));
  d.setHours(0, 0, 0, 0);
  return d;
}

// POST /api/insights/login — dedicated viewer account (separate from admin).
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user || user.role !== 'viewer' || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: signInsightsToken(user), user: { username: user.username, role: user.role } });
});

router.get('/me', requireInsights, (req, res) => res.json({ user: req.viewer }));

// GET /api/insights/overview — headline KPIs (today + all-time).
router.get('/overview', requireInsights, async (req, res) => {
  const sod = startOfToday();
  const [paid, todayPaid, memberCount, memberAgg] = await Promise.all([
    prisma.order.findMany({ where: { status: 'paid' }, select: { total: true, paymentMethod: true } }),
    prisma.order.findMany({ where: { status: 'paid', paidAt: { gte: sod } }, select: { total: true } }),
    prisma.member.count(),
    prisma.member.aggregate({ _sum: { points: true } }),
  ]);
  const sum = (a) => a.reduce((s, o) => s + o.total, 0);
  res.json({
    todayRevenue: Number(sum(todayPaid).toFixed(2)),
    todayOrders: todayPaid.length,
    revenue: Number(sum(paid).toFixed(2)),
    paidOrderCount: paid.length,
    cashRevenue: Number(sum(paid.filter((o) => o.paymentMethod === 'cash')).toFixed(2)),
    cardRevenue: Number(sum(paid.filter((o) => o.paymentMethod === 'card')).toFixed(2)),
    memberCount,
    totalPoints: memberAgg._sum.points || 0,
  });
});

// GET /api/insights/daily?days=30
router.get('/daily', requireInsights, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: 'paid', createdAt: { gte: sinceDays(req.query.days) } },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const byDay = {};
  for (const o of orders) {
    const k = o.createdAt.toISOString().slice(0, 10);
    if (!byDay[k]) byDay[k] = { date: k, revenue: 0, count: 0 };
    byDay[k].revenue += o.total;
    byDay[k].count += 1;
  }
  res.json(Object.values(byDay).map((d) => ({ ...d, revenue: Number(d.revenue.toFixed(2)) })));
});

// GET /api/insights/top-products?days=30
router.get('/top-products', requireInsights, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: 'paid', createdAt: { gte: sinceDays(req.query.days) } },
    select: { items: true },
  });
  const map = {};
  for (const o of orders)
    for (const it of Array.isArray(o.items) ? o.items : []) {
      if (it.pointsCost || String(it.name).startsWith('🎁')) continue;
      (map[it.name] ||= { name: it.name, qty: 0, revenue: 0 });
      map[it.name].qty += it.quantity;
      map[it.name].revenue += (it.price || 0) * it.quantity;
    }
  res.json(
    Object.values(map)
      .map((d) => ({ ...d, revenue: Number(d.revenue.toFixed(2)) }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 15)
  );
});

// GET /api/insights/top-members — best customers by lifetime spend.
router.get('/top-members', requireInsights, async (req, res) => {
  const grouped = await prisma.order.groupBy({
    by: ['phone'],
    where: { status: 'paid', phone: { not: '' } },
    _sum: { total: true },
    _count: true,
  });
  grouped.sort((a, b) => (b._sum.total || 0) - (a._sum.total || 0));
  const top = grouped.slice(0, 15);
  const members = await prisma.member.findMany({
    where: { phone: { in: top.map((g) => g.phone) } },
    select: { phone: true, name: true, points: true },
  });
  const byPhone = Object.fromEntries(members.map((m) => [m.phone, m]));
  res.json(
    top.map((g) => ({
      phone: g.phone,
      name: byPhone[g.phone]?.name || '',
      points: byPhone[g.phone]?.points ?? 0,
      visits: g._count,
      spend: Number((g._sum.total || 0).toFixed(2)),
    }))
  );
});

// GET /api/insights/recent-orders — latest paid orders.
router.get('/recent-orders', requireInsights, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: 'paid' },
    orderBy: { paidAt: 'desc' },
    take: 12,
    select: { id: true, dailyNumber: true, table: true, total: true, paymentMethod: true, phone: true, paidAt: true },
  });
  res.json(orders);
});

export default router;
