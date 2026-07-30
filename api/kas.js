import { getAdminDb } from './_lib/firebaseAdmin.js';
import { verifyOfficerToken } from './_lib/session.js';
import { mengandungKataKasar } from '../src/utils/kataKasar.js';

const ROLES = ['ketua', 'wakil', 'sekretaris', 'bendahara'];

function cekAuth(req) {
  const { token, role } = req.body || req.query || {};
  if (!ROLES.includes(role)) return { ok: false };
  const { valid } = verifyOfficerToken(token, role);
  return { ok: valid, role };
}

export default async function handler(req, res) {
  const db = getAdminDb();

  if (req.method === 'GET') {
    const { token, role } = req.query;
    const { valid } = verifyOfficerToken(token, role);
    if (!valid) return res.status(401).json({ ok: false, error: 'Sesi tidak valid.' });

    try {
      const snap = await db.collection('kasKelas').orderBy('tanggal', 'desc').get();
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const saldo = data.reduce((acc, t) => acc + (t.tipe === 'masuk' ? t.jumlah : -t.jumlah), 0);
      return res.status(200).json({ ok: true, data, saldo });
    } catch (e) {
      console.error('kas GET error:', e);
      return res.status(500).json({ ok: false, error: 'Gagal memuat data kas.' });
    }
  }

  const auth = cekAuth(req);
  if (!auth.ok) return res.status(401).json({ ok: false, error: 'Sesi tidak valid atau sudah kedaluwarsa.' });

  try {
    if (req.method === 'POST') {
      const { id, tanggal, keterangan, tipe, jumlah, siswaId, siswaNama } = req.body || {};
      const keteranganBersih = (keterangan || '').trim();
      const jumlahAngka = Number(jumlah);
      if (!tanggal || !keteranganBersih || !['masuk', 'keluar'].includes(tipe) || !Number.isFinite(jumlahAngka) || jumlahAngka <= 0) {
        return res.status(400).json({ ok: false, error: 'Tanggal, keterangan, tipe (masuk/keluar), dan jumlah (>0) wajib diisi dengan benar.' });
      }
      if (mengandungKataKasar(keteranganBersih)) {
        return res.status(400).json({ ok: false, error: '⚠ Mengandung kata yang tidak pantas.' });
      }
      const payload = {
        tanggal,
        keterangan: keteranganBersih,
        tipe,
        jumlah: jumlahAngka,
        siswaId: siswaId || null,   // opsional — kalau diisi, catatan ini terhitung "milik" siswa tsb (mis. iuran bulanan)
        siswaNama: siswaNama || null,
        updatedBy: auth.role,
        updatedAt: new Date().toISOString(),
      };
      if (id) {
        await db.collection('kasKelas').doc(id).set(payload, { merge: true });
        return res.status(200).json({ ok: true, id });
      }
      payload.createdAt = new Date().toISOString();
      payload.createdBy = auth.role;
      const ref = await db.collection('kasKelas').add(payload);
      return res.status(200).json({ ok: true, id: ref.id });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ ok: false, error: 'id wajib diisi.' });
      await db.collection('kasKelas').doc(id).delete();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    console.error('kas error:', e);
    return res.status(500).json({ ok: false, error: 'Terjadi kesalahan server.' });
  }
}
