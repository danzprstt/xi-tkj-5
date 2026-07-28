import { getAdminDb } from './_lib/firebaseAdmin.js';
import { hashKey, buatOfficerToken } from './_lib/session.js';

const ROLES = ['ketua', 'wakil', 'sekretaris', 'bendahara'];
const MAKS_PERCOBAAN = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 menit

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { role, key } = req.body || {};
  if (!ROLES.includes(role)) {
    return res.status(400).json({ ok: false, error: 'Role tidak dikenal.' });
  }
  if (!key || !String(key).trim()) {
    return res.status(400).json({ ok: false, error: 'Kode wajib diisi.' });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection('officerKeys').doc(role);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ ok: false, error: 'Kode untuk role ini belum di-generate. Hubungi admin.' });
    }

    const data = snap.data();

    // Proteksi brute-force: kunci 15 menit kalau salah 5x berturut-turut.
    if (data.lockedUntil && data.lockedUntil > Date.now()) {
      const sisaMenit = Math.ceil((data.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ ok: false, error: `Terlalu banyak percobaan salah. Coba lagi dalam ${sisaMenit} menit.` });
    }

    const cocok = data.keyHash === hashKey(key);

    if (!cocok) {
      const failedAttempts = (data.failedAttempts || 0) + 1;
      const update = { failedAttempts };
      if (failedAttempts >= MAKS_PERCOBAAN) {
        update.lockedUntil = Date.now() + LOCKOUT_MS;
        update.failedAttempts = 0;
      }
      await ref.update(update);
      return res.status(401).json({ ok: false, error: 'Kode salah.' });
    }

    await ref.update({ failedAttempts: 0, lockedUntil: null });
    const token = buatOfficerToken(role);
    return res.status(200).json({ ok: true, token, role, nama: data.nama || role });
  } catch (e) {
    console.error('verify-officer-key error:', e);
    return res.status(500).json({ ok: false, error: 'Terjadi kesalahan server.' });
  }
}
