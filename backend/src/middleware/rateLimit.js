// Tiny in-memory rate limiter for the login endpoint (brute-force protection).
// No external dependency. Good enough for a single-instance deployment.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;
const hits = new Map(); // ip -> { count, resetAt }

export function loginLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  let rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + WINDOW_MS };
    hits.set(ip, rec);
  }
  rec.count += 1;
  if (rec.count > MAX_ATTEMPTS) {
    const retry = Math.ceil((rec.resetAt - now) / 1000);
    res.set('Retry-After', String(retry));
    return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  }
  next();
}

// Periodic cleanup so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of hits) if (now > rec.resetAt) hits.delete(ip);
}, WINDOW_MS).unref();
