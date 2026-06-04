import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login  { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({
    token: signToken(admin),
    admin: { id: admin.id, username: admin.username, role: admin.role },
  });
});

// GET /api/auth/me — verify token, return current admin
router.get('/me', requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
