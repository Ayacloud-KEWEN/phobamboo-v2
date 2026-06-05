import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireOwner } from '../middleware/auth.js';
import { sendSms, smsConfigured, smsProvider } from '../lib/sms.js';

const router = Router();

// GET /api/marketing/audience — how many members opted in to SMS (owner).
router.get('/audience', requireAuth, requireOwner, async (req, res) => {
  const count = await prisma.member.count({ where: { acceptsSMS: true } });
  res.json({ count, provider: smsProvider, configured: smsConfigured() });
});

// POST /api/marketing/test — send one test SMS (owner). Body: { to, message }
router.post('/test', requireAuth, requireOwner, async (req, res) => {
  const to = String(req.body.to || '');
  const message = String(req.body.message || '').slice(0, 480);
  if (!to || !message) return res.status(400).json({ error: 'to and message required' });
  const r = await sendSms(to, message);
  res.json(r);
});

// POST /api/marketing/send — broadcast to all opted-in members (owner). Body: { message }
router.post('/send', requireAuth, requireOwner, async (req, res) => {
  const message = String(req.body.message || '').slice(0, 480);
  if (!message) return res.status(400).json({ error: 'message required' });

  const members = await prisma.member.findMany({
    where: { acceptsSMS: true, phone: { not: '' } },
    select: { phone: true },
    take: 2000,
  });

  let sent = 0;
  let failed = 0;
  for (const m of members) {
    try {
      const r = await sendSms(m.phone, message);
      r.ok ? sent++ : failed++;
    } catch {
      failed++;
    }
  }
  res.json({ sent, failed, total: members.length, simulated: !smsConfigured() });
});

export default router;
