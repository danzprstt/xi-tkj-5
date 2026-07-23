import { getAdminDb } from './_lib/firebaseAdmin.js';
import { buatSessionToken, hashKey } from './_lib/session.js';

const MAX_PERCOBAAN = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 menit

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { sid, key } = req.body || {};
  if (!sid || !key) return res.status(400).json({ ok: false, error: 'sid dan key wajib diisi.' });

  try {
    const db = getAdminDb();
    const ref = db.collection('editKeys').doc(sid);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ ok: false, error: 'Belum ada kode edit untuk siswa ini.' });
    }

    const data = snap.data();
    const now = Date.now();
    if (data.lockedUntil && data.lockedUntil > now) {
      const menit = Math.ceil((data.lockedUntil - now) / 60000);
      return res.status(429).json({ ok: false, error: `Terlalu banyak percobaan salah. Coba lagi dalam ${menit} menit.` });
    }

    if (hashKey(key) !== data.keyHash) {
      const gagal = (data.failedAttempts || 0) + 1;
      const update = { failedAttempts: gagal };
      if (gagal >= MAX_PERCOBAAN) {
        update.lockedUntil = now + LOCKOUT_MS;
        update.failedAttempts = 0;
      }
      await ref.set(update, { merge: true });
      const sisa = Math.max(0, MAX_PERCOBAAN - gagal);
      return res.status(401).json({
        ok: false,
        error: gagal >= MAX_PERCOBAAN
          ? `Kode salah 5x — coba lagi 15 menit lagi.`
          : `Kode salah. Sisa percobaan: ${sisa}.`,
      });
    }

    // Kode benar — reset penghitung gagal, keluarkan token sesi 30 menit.
    await ref.set({ failedAttempts: 0, lockedUntil: null }, { merge: true });
    const token = buatSessionToken(sid);
    return res.status(200).json({ ok: true, token });
  } catch (e) {
    console.error('verify-key error:', e);
    return res.status(500).json({ ok: false, error: 'Terjadi kesalahan server.' });
  }
}
