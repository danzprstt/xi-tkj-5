import { verifySessionToken } from './_lib/session.js';
import { getFile, putFile } from './_lib/github.js';
import { replaceSiswaPhoto, replaceLaguEntry } from './_lib/dataFile.js';

const EXT_FOTO = new Set(['jpg', 'jpeg', 'png', 'webp']);
const EXT_LAGU = new Set(['mp3', 'ogg', 'wav', 'm4a']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { token, sid, no, judul, pencipta, keterangan, fotoBase64, fotoExt, laguBase64, laguExt } = req.body || {};
  if (!sid || !no) return res.status(400).json({ ok: false, error: 'sid dan no wajib diisi.' });

  const { valid } = verifySessionToken(token, sid);
  if (!valid) {
    return res.status(401).json({ ok: false, error: 'Sesi tidak valid atau sudah kedaluwarsa. Verifikasi ulang kode kamu.' });
  }

  try {
    const commits = [];

    // ── Upload foto baru (kalau ada) ──
    let fotoPath = null;
    if (fotoBase64) {
      const ext = (fotoExt || 'jpg').toLowerCase();
      if (!EXT_FOTO.has(ext)) return res.status(400).json({ ok: false, error: 'Format foto tidak didukung.' });
      fotoPath = `public/siswa_i/${sid}.${ext}`;
      const existing = await getFile(fotoPath).catch(() => null);
      await putFile({
        path: fotoPath,
        contentBase64: fotoBase64,
        message: `Update foto ${sid} lewat halaman edit`,
        sha: existing ? existing.sha : undefined,
      });
      commits.push('foto');
    }

    // ── Upload file lagu baru (kalau ada) ──
    let laguPath = null;
    if (laguBase64) {
      const ext = (laguExt || 'mp3').toLowerCase();
      if (!EXT_LAGU.has(ext)) return res.status(400).json({ ok: false, error: 'Format lagu tidak didukung.' });
      laguPath = `public/lagu/${no}.${ext}`;
      const existing = await getFile(laguPath).catch(() => null);
      await putFile({
        path: laguPath,
        contentBase64: laguBase64,
        message: `Update lagu siswa no.${no} lewat halaman edit`,
        sha: existing ? existing.sha : undefined,
      });
      commits.push('lagu');
    }

    // ── Update src/data/siswa.js (field photo) ──
    if (fotoPath) {
      const siswaFile = await getFile('src/data/siswa.js');
      const newText = replaceSiswaPhoto(siswaFile.contentText, no, '/' + fotoPath.replace(/^public\//, ''));
      await putFile({
        path: 'src/data/siswa.js',
        contentBase64: Buffer.from(newText, 'utf8').toString('base64'),
        message: `Update path foto siswa no.${no}`,
        sha: siswaFile.sha,
      });
      commits.push('siswa.js');
    }

    // ── Update src/data/lagu.js (link/judul/pencipta/keterangan) ──
    const adaTeksLagu = judul !== undefined || pencipta !== undefined || keterangan !== undefined;
    if (laguPath || adaTeksLagu) {
      const laguFile = await getFile('src/data/lagu.js');
      const newText = replaceLaguEntry(laguFile.contentText, no, {
        link: laguPath ? '/' + laguPath.replace(/^public\//, '') : undefined,
        judul,
        pencipta,
        keterangan,
      });
      await putFile({
        path: 'src/data/lagu.js',
        contentBase64: Buffer.from(newText, 'utf8').toString('base64'),
        message: `Update data lagu siswa no.${no}`,
        sha: laguFile.sha,
      });
      commits.push('lagu.js');
    }

    if (!commits.length) {
      return res.status(400).json({ ok: false, error: 'Tidak ada perubahan yang dikirim.' });
    }

    return res.status(200).json({
      ok: true,
      commits,
      note: 'Perubahan sudah ter-commit ke GitHub. Vercel akan otomatis build & deploy ulang (biasanya 1-3 menit).',
    });
  } catch (e) {
    console.error('edit-profil error:', e);
    return res.status(500).json({ ok: false, error: e.message || 'Terjadi kesalahan server.' });
  }
}
