import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { Server as SocketServer } from 'socket.io';

import { setIO } from './lib/realtime.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import rewardRoutes from './routes/rewards.js';
import orderRoutes from './routes/orders.js';
import memberRoutes from './routes/members.js';
import configRoutes from './routes/config.js';
import uploadRoutes from './routes/upload.js';
import statsRoutes from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim());
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

app.use(cors({ origin: ORIGINS.includes('*') ? true : ORIGINS }));
app.use(express.json({ limit: '2mb' }));

// Serve uploaded menu images from VPS disk.
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/config', configRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

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

// --- HTTP + WebSocket ---
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: ORIGINS.includes('*') ? true : ORIGINS },
});
setIO(io);

io.on('connection', (socket) => {
  // Frontend joins "counter" or "kds" to receive order events.
  socket.on('join', (room) => {
    if (room === 'counter' || room === 'kds') socket.join(room);
  });
});

server.listen(PORT, () => {
  console.log(`🎋 PhoBamboo backend listening on :${PORT}`);
});
