import { getAdminDb } from './_lib/firebaseAdmin.js';
import { verifyOfficerToken } from './_lib/session.js';
import { mengandungKataKasar } from '../src/utils/kataKasar.js';

const ROLES = ['ketua', 'wakil', 'sekretaris', 'bendahara'];

function cekAuth(req) {
  const { token, role } = req.body || {};
  if (!ROLES.includes(role)) return { ok: false };
  const { valid } = verifyOfficerToken(token, role);
  return { ok: valid, role };
}

export default async function handler(req, res) {
  const db = getAdminDb();

  if (req.method === 'GET') {
    // Publik — dipakai buat nampilin pengumuman di halaman utama tanpa perlu login.
    try {
      const snap = await db.collection('pengumuman').orderBy('createdAt', 'desc').get();
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ ok: true, data });
    } catch (e) {
      console.error('pengumuman GET error:', e);
      return res.status(500).json({ ok: false, error: 'Gagal memuat pengumuman.' });
    }
  }

  const auth = cekAuth(req);
  if (!auth.ok) return res.status(401).json({ ok: false, error: 'Sesi tidak valid atau sudah kedaluwarsa.' });

  try {
    if (req.method === 'POST') {
      const { id, judul, isi } = req.body || {};
      const judulBersih = (judul || '').trim();
      const isiBersih = (isi || '').trim();
      if (!judulBersih || !isiBersih) {
        return res.status(400).json({ ok: false, error: 'Judul dan isi wajib diisi.' });
      }
      if (mengandungKataKasar(judulBersih) || mengandungKataKasar(isiBersih)) {
        return res.status(400).json({ ok: false, error: '⚠ Mengandung kata yang tidak pantas.' });
      }
      const payload = { judul: judulBersih, isi: isiBersih, updatedBy: auth.role, updatedAt: new Date().toISOString() };
      if (id) {
        await db.collection('pengumuman').doc(id).set(payload, { merge: true });
        return res.status(200).json({ ok: true, id });
      }
      payload.createdAt = new Date().toISOString();
      payload.createdBy = auth.role;
      const ref = await db.collection('pengumuman').add(payload);
      return res.status(200).json({ ok: true, id: ref.id });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ ok: false, error: 'id wajib diisi.' });
      await db.collection('pengumuman').doc(id).delete();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    console.error('pengumuman error:', e);
    return res.status(500).json({ ok: false, error: 'Terjadi kesalahan server.' });
  }
}
