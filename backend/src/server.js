import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { Server as SocketServer } from 'socket.io';

import { setIO } from './lib/realtime.js';
import { loginLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import rewardRoutes from './routes/rewards.js';
import orderRoutes from './routes/orders.js';
import memberRoutes from './routes/members.js';
import configRoutes from './routes/config.js';
import uploadRoutes from './routes/upload.js';
import statsRoutes from './routes/stats.js';
import insightsRoutes from './routes/insights.js';

const app = express();
const PORT = process.env.PORT || 4000;
// Bind address. Once behind the CloudPanel reverse proxy, set HOST=127.0.0.1
// so the app is no longer reachable directly from the internet on :PORT.
const HOST = process.env.HOST || '0.0.0.0';
const ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim());
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
if (JWT_SECRET === 'dev-secret') {
  console.warn('⚠️  JWT_SECRET non défini ! Mettez une valeur aléatoire dans .env (openssl rand -hex 32) avant la prod.');
}

// Trust the first proxy hop (CloudPanel/Nginx) so req.ip is the real client IP.
app.set('trust proxy', 1);

app.use(cors({ origin: ORIGINS.includes('*') ? true : ORIGINS }));
app.use(express.json({ limit: '2mb' }));

// Serve uploaded menu images from VPS disk.
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Wrap async route handlers so rejected promises hit the error middleware
// instead of crashing the process. Applied to every router below.
const wrapAsync = (router) => {
  for (const layer of router.stack || []) {
    const route = layer.route;
    if (!route) continue;
    route.stack.forEach((s) => {
      const fn = s.handle;
      if (fn.length < 4) {
        s.handle = (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
      }
    });
  }
  return router;
};
app.use('/api/auth/login', loginLimiter);
app.use('/api/insights/login', loginLimiter);
app.use('/api/auth', wrapAsync(authRoutes));
app.use('/api/insights', wrapAsync(insightsRoutes));
app.use('/api/products', wrapAsync(productRoutes));
app.use('/api/rewards', wrapAsync(rewardRoutes));
app.use('/api/orders', wrapAsync(orderRoutes));
app.use('/api/members', wrapAsync(memberRoutes));
app.use('/api/config', wrapAsync(configRoutes));
app.use('/api/upload', wrapAsync(uploadRoutes));
app.use('/api/stats', wrapAsync(statsRoutes));

// --- Serve the built frontend (single-port deploy) ---
// Set FRONTEND_DIR to the Vite build output. When present, the backend serves
// the SPA so one port (and later one CloudPanel reverse-proxy + SSL) covers
// everything — same-origin /api and /socket.io, no CORS needed.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(
  process.env.FRONTEND_DIR || path.join(__dirname, '../../frontend/dist')
);
if (fs.existsSync(path.join(FRONTEND_DIR, 'index.html'))) {
  app.use(express.static(FRONTEND_DIR));
  // SPA fallback: anything not handled above (and not /api, /uploads, /socket.io)
  // returns index.html so Vue Router can take over.
  app.get(/^\/(?!api|uploads|socket\.io).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });
  console.log(`🖥️  Serving frontend from ${FRONTEND_DIR}`);
}

// Central error handler — returns JSON 500 instead of crashing.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('API error:', err?.message || err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Server error' });
});

// Last-resort safety net so a stray rejection never kills the process.
process.on('unhandledRejection', (e) => console.error('UnhandledRejection:', e));
process.on('uncaughtException', (e) => console.error('UncaughtException:', e));

// --- HTTP + WebSocket ---
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: ORIGINS.includes('*') ? true : ORIGINS },
});
setIO(io);

// Only authenticated admins may connect — order events contain customer phone
// numbers, so the counter/kds rooms must not be public.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('unauthorized'));
  try {
    socket.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    if (room === 'counter' || room === 'kds') socket.join(room);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🎋 PhoBamboo backend listening on ${HOST}:${PORT}`);
});
