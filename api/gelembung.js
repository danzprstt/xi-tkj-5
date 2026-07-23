import { getAdminDb } from './_lib/firebaseAdmin.js';
import { verifySessionToken } from './_lib/session.js';
import { mengandungKataKasar } from '../src/utils/kataKasar.js';

export default async function handler(req, res) {
  const db = getAdminDb();

  if (req.method === 'GET') {
    // Publik — dipakai buat nampilin gelembung mimpi di halaman utama, tanpa perlu login.
    try {
      const snap = await db.collection('gelembungMimpi').get();
      const data = {};
      snap.forEach((d) => { data[d.id] = d.data().teks; });
      return res.status(200).json({ ok: true, data });
    } catch (e) {
      console.error('gelembung GET error:', e);
      return res.status(500).json({ ok: false, error: 'Gagal memuat gelembung mimpi.' });
    }
  }

  const { token, sid, teks } = req.body || {};
  if (!sid) return res.status(400).json({ ok: false, error: 'sid wajib diisi.' });

  const { valid } = verifySessionToken(token, sid);
  if (!valid) {
    return res.status(401).json({ ok: false, error: 'Sesi tidak valid atau sudah kedaluwarsa.' });
  }

  try {
    if (req.method === 'POST') {
      const bersih = (teks || '').trim();
      if (!bersih) return res.status(400).json({ ok: false, error: 'Teks tidak boleh kosong.' });
      if (bersih.length > 120) return res.status(400).json({ ok: false, error: 'Maksimal 120 karakter.' });
      if (mengandungKataKasar(bersih)) {
        return res.status(400).json({ ok: false, error: '⚠ Mengandung kata yang tidak pantas.' });
      }
      await db.collection('gelembungMimpi').doc(sid).set({
        teks: bersih,
        updatedAt: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await db.collection('gelembungMimpi').doc(sid).delete();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    console.error('gelembung error:', e);
    return res.status(500).json({ ok: false, error: 'Terjadi kesalahan server.' });
  }
}
