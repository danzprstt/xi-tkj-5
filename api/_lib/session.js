import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || '';
const EXPIRY_MS = 30 * 60 * 1000; // token sesi edit berlaku 30 menit

function hmac(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex');
}

/**
 * Bikin token sesi setelah kode verifikasi siswa terbukti benar.
 * Format: base64(sid.exp).signature — signature di-HMAC pakai SESSION_SECRET
 * (server-only), jadi client tidak bisa memalsukan/mengubah `sid` di dalamnya.
 */
export function buatSessionToken(sid) {
  const exp = Date.now() + EXPIRY_MS;
  const payload = Buffer.from(`${sid}.${exp}`).toString('base64url');
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

/**
 * Verifikasi token; return { valid, sid } — valid=false kalau signature tidak
 * cocok, token kadaluarsa, atau sid di token beda dengan sid yang diminta.
 */
export function verifySessionToken(token, expectedSid) {
  try {
    const [payload, sig] = String(token || '').split('.');
    if (!payload || !sig) return { valid: false };
    if (hmac(payload) !== sig) return { valid: false };
    const [sid, expStr] = Buffer.from(payload, 'base64url').toString('utf8').split('.');
    const exp = Number(expStr);
    if (!exp || Date.now() > exp) return { valid: false };
    if (expectedSid && sid !== expectedSid) return { valid: false };
    return { valid: true, sid };
  } catch {
    return { valid: false };
  }
}

export function hashKey(key) {
  return crypto.createHash('sha256').update(String(key).trim().toUpperCase()).digest('hex');
}
