import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../middleware/auth.js';

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
// Optional absolute prefix. Left empty, uploads return a relative /uploads/...
// path so images keep working across IP→domain changes (same-origin serving).
const PUBLIC_URL = process.env.PUBLIC_URL || '';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webp';
    cb(null, `menu_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    cb(null, /^image\//.test(file.mimetype));
  },
});

const router = Router();

// POST /api/upload (admin) — multipart field "file". Returns { url }.
router.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file' });
  res.json({ url: `${PUBLIC_URL}/uploads/${req.file.filename}` });
});

export default router;
