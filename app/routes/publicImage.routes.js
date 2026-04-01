/**
 * Harici ürün görsellerini sunucu üzerinden iletir.
 * - Sadece allowlist hostlar (Wikimedia, Hürriyet CDN)
 * - Disk önbelleği: her URL yalnızca 1 kez indirilir; sonraki istekler diskten gelir
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const ALLOWED_HOSTS = new Set([
  'upload.wikimedia.org',
  'image.hurimg.com',
  'encrypted-tbn0.gstatic.com',
  'www.bettycrocker.com',
]);

const CACHE_DIR = path.join(__dirname, '..', '..', 'app_cache', 'images');
try {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
} catch {
  // ignore
}

const EXT_BY_TYPE = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

function cacheKey(url) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

function findCacheFile(key) {
  for (const ext of Object.values(EXT_BY_TYPE)) {
    const p = path.join(CACHE_DIR, key + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function extFromContentType(ct) {
  if (!ct) return '.bin';
  const base = ct.split(';')[0].trim().toLowerCase();
  return EXT_BY_TYPE[base] || '.bin';
}

function serveCachedFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const ctMap = { '.jpg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
  const ct = ctMap[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', ct);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('X-Image-Cache', 'HIT');
  const stat = fs.statSync(filePath);
  res.setHeader('Content-Length', stat.size);
  fs.createReadStream(filePath).pipe(res);
}

/** Aktif olarak yazılan dosyalar — aynı URL'ye paralel istek gelirse bekletir */
const pending = new Map();

function fetchAndCache(sourceUrl, res, depth) {
  if (depth > 10) {
    if (!res.headersSent) res.status(502).end();
    return;
  }
  let parsed;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    if (!res.headersSent) res.status(400).end();
    return;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    if (!res.headersSent) res.status(400).end();
    return;
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    if (!res.headersSent) res.status(403).end();
    return;
  }

  const key = cacheKey(sourceUrl);
  const cached = findCacheFile(key);
  if (cached) {
    serveCachedFile(cached, res);
    return;
  }

  // Paralel istek: aynı URL zaten indiriliyor → beklet
  if (pending.has(key)) {
    pending.get(key).push(res);
    return;
  }
  pending.set(key, []);

  const lib = parsed.protocol === 'https:' ? https : http;
  const opts = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: `${parsed.pathname}${parsed.search}`,
    method: 'GET',
    headers: {
      'User-Agent': 'StokerEnvanter/1.0 (local inventory; contact owner)',
      Accept: 'image/*,*/*;q=0.8',
    },
    timeout: 30_000,
  };

  const reqOut = lib.request(opts, (inc) => {
    if ([301, 302, 303, 307, 308].includes(inc.statusCode) && inc.headers.location) {
      let nextUrl;
      try {
        nextUrl = new URL(inc.headers.location, sourceUrl).href;
      } catch {
        inc.resume();
        pending.delete(key);
        if (!res.headersSent) res.status(502).end();
        return;
      }
      const nextHost = (() => { try { return new URL(nextUrl).hostname; } catch { return ''; } })();
      if (!ALLOWED_HOSTS.has(nextHost)) {
        inc.resume();
        pending.delete(key);
        if (!res.headersSent) res.status(403).end();
        return;
      }
      inc.resume();
      const waiters = pending.get(key) || [];
      pending.delete(key);
      fetchAndCache(nextUrl, res, depth + 1);
      for (const w of waiters) fetchAndCache(nextUrl, w, depth + 1);
      return;
    }

    if (inc.statusCode !== 200) {
      inc.resume();
      const waiters = pending.get(key) || [];
      pending.delete(key);
      const code = inc.statusCode >= 400 && inc.statusCode < 600 ? inc.statusCode : 502;
      if (!res.headersSent) res.status(code).end();
      for (const w of waiters) { if (!w.headersSent) w.status(code).end(); }
      return;
    }

    const ct = (inc.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    const ext = extFromContentType(ct);
    const filePath = path.join(CACHE_DIR, key + ext);
    const tmpPath = filePath + '.tmp';

    const fileStream = fs.createWriteStream(tmpPath);
    const chunks = [];

    inc.on('data', (chunk) => {
      fileStream.write(chunk);
      chunks.push(chunk);
    });

    inc.on('end', () => {
      fileStream.end();
      fileStream.on('finish', () => {
        try { fs.renameSync(tmpPath, filePath); } catch { /* ignore */ }
        const waiters = pending.get(key) || [];
        pending.delete(key);

        // Birincil yanıt
        if (!res.headersSent) {
          res.setHeader('Content-Type', ct || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('X-Image-Cache', 'MISS');
          for (const c of chunks) res.write(c);
          res.end();
        }

        // Bekleyen yanıtlar — dosyadan servis et
        for (const w of waiters) {
          if (!w.headersSent) {
            const cf = findCacheFile(key);
            if (cf) serveCachedFile(cf, w);
            else w.status(502).end();
          }
        }
      });
    });

    inc.on('error', () => {
      try { fileStream.destroy(); fs.unlinkSync(tmpPath); } catch { /* ignore */ }
      const waiters = pending.get(key) || [];
      pending.delete(key);
      if (!res.headersSent) res.status(502).end();
      for (const w of waiters) { if (!w.headersSent) w.status(502).end(); }
    });
  });

  reqOut.on('error', () => {
    const waiters = pending.get(key) || [];
    pending.delete(key);
    if (!res.headersSent) res.status(502).end();
    for (const w of waiters) { if (!w.headersSent) w.status(502).end(); }
  });
  reqOut.on('timeout', () => {
    reqOut.destroy();
    const waiters = pending.get(key) || [];
    pending.delete(key);
    if (!res.headersSent) res.status(504).end();
    for (const w of waiters) { if (!w.headersSent) w.status(504).end(); }
  });
  reqOut.end();
}

function streamPublicImage(req, res) {
  const u = req.query.u;
  if (!u || typeof u !== 'string') {
    return res.status(400).send('missing u');
  }
  let decoded = u;
  try { decoded = decodeURIComponent(u); } catch { /* raw */ }
  let target;
  try {
    target = new URL(decoded);
  } catch {
    return res.status(400).send('invalid url');
  }
  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return res.status(403).end();
  }
  fetchAndCache(target.href, res, 0);
}

module.exports = { streamPublicImage };
