import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/products?available=true  (public — used by index/order)
router.get('/', async (req, res) => {
  const where = {};
  if (req.query.available === 'true') where.available = true;
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { nameFr: 'asc' }],
  });

  // Resolve combo entrée options (by id) so the order page can show them even
  // if a referenced entrée isn't separately listed/available in this result.
  const ids = new Set();
  for (const p of products) for (const id of Array.isArray(p.comboOptions) ? p.comboOptions : []) ids.add(String(id));
  let entreeMap = {};
  if (ids.size) {
    const entrees = await prisma.product.findMany({
      where: { id: { in: [...ids] } },
      select: { id: true, nameFr: true, nameEn: true, nameZh: true, image: true, price: true },
    });
    entreeMap = Object.fromEntries(entrees.map((e) => [e.id, e]));
  }
  const out = products.map((p) => ({
    ...p,
    comboEntrees: (Array.isArray(p.comboOptions) ? p.comboOptions : [])
      .map((id) => entreeMap[String(id)])
      .filter(Boolean),
  }));
  res.json(out);
});

// Everything below requires admin auth (menu page).
router.post('/', requireAuth, async (req, res) => {
  const product = await prisma.product.create({ data: sanitize(req.body) });
  res.status(201).json(product);
});

router.put('/:id', requireAuth, async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: sanitize(req.body),
  });
  res.json(product);
});

router.patch('/:id/availability', requireAuth, async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { available: !!req.body.available },
  });
  res.json(product);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// Whitelist + coerce incoming fields so the API never trusts the client blindly.
function sanitize(b = {}) {
  return {
    nameZh: String(b.nameZh ?? ''),
    nameEn: String(b.nameEn ?? ''),
    nameFr: String(b.nameFr ?? ''),
    price: Number(b.price) || 0,
    category: String(b.category ?? ''),
    subCategory: String(b.subCategory ?? ''),
    description: String(b.description ?? ''),
    image: String(b.image ?? ''),
    popular: !!b.popular,
    spicy: !!b.spicy,
    vegan: !!b.vegan,
    available: b.available === undefined ? true : !!b.available,
    comboOptions: Array.isArray(b.comboOptions) ? b.comboOptions : [],
    sortOrder: Number(b.sortOrder) || 0,
  };
}

export default router;
