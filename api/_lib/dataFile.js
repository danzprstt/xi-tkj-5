// Helper ini mengedit HANYA blok object milik satu siswa/nomor di dalam
// src/data/siswa.js dan src/data/lagu.js, tanpa menyentuh entri siswa lain.
//
// PENTING: siswa.js dan lagu.js punya STRUKTUR BERBEDA:
//   siswa.js →  {no:1, nama:"...", lp:"L", photo:"..."}   ({ MUNCUL SEBELUM "no:1")
//   lagu.js  →  1: { link: "...", judul: "...", ... }      ({ MUNCUL SESUDAH "1:")
// Makanya dua fungsi di bawah punya arah pencarian brace yang beda —
// disengaja, BUKAN salah ketik.

function findMatchingBrace(text, braceStart) {
  let depth = 0;
  for (let i = braceStart; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function setStringField(block, field, value) {
  const re = new RegExp(`(${field}\\s*:\\s*)(["'])(?:(?!\\2).)*\\2`);
  const safe = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  if (re.test(block)) return block.replace(re, `$1"${safe}"`);
  // field belum ada di blok itu — tambahkan sebelum kurung tutup
  return block.replace(/\}$/, `, ${field}: "${safe}"}`);
}

/**
 * Ganti field `photo` untuk siswa dengan nomor `no` di isi file siswa.js.
 * Struktur: {no:1, nama:"...", lp:"L", photo:"..."} — object DIAWALI `{`,
 * jadi kita cari "no:<N>," dulu lewat regex anchor `\bno:N,` (word-boundary,
 * supaya no:1 tidak nyasar ke no:11/no:21), lalu cari `{` TERDEKAT SEBELUM
 * posisi itu (backward search), bukan sesudahnya.
 */
export function replaceSiswaPhoto(fileText, no, newPhotoPath) {
  const re = new RegExp(`\\bno:\\s*${no}\\s*,`);
  const m = re.exec(fileText);
  if (!m) throw new Error(`Entri siswa no:${no} tidak ditemukan di siswa.js`);

  const braceStart = fileText.lastIndexOf('{', m.index);
  if (braceStart === -1) throw new Error(`Tidak ketemu "{" pembuka untuk siswa no:${no}`);
  const braceEnd = findMatchingBrace(fileText, braceStart);
  if (braceEnd === -1) throw new Error(`Tidak ketemu "}" penutup untuk siswa no:${no}`);

  const block = fileText.slice(braceStart, braceEnd + 1);
  // Validasi ekstra: pastikan needle beneran ada di dalam block yang ditemukan
  // (jaga-jaga kalau ada nested object aneh di masa depan).
  if (!re.test(block)) throw new Error(`Validasi gagal: blok yang ditemukan untuk no:${no} tidak konsisten.`);

  const newBlock = setStringField(block, 'photo', newPhotoPath);
  return fileText.slice(0, braceStart) + newBlock + fileText.slice(braceEnd + 1);
}

/**
 * Ganti field link/judul/pencipta/keterangan untuk lagu nomor `no` di lagu.js.
 * Struktur: `21: { link: "...", ... }` — key ANGKA muncul SEBELUM `{`, jadi
 * arahnya kebalikan dari siswa.js: cari key dulu (anchor line-start supaya
 * "21:" tidak nyasar ke "121:" atau ke teks di dalam string value manapun),
 * lalu cari `{` TERDEKAT SESUDAH posisi itu (forward search).
 */
export function replaceLaguEntry(fileText, no, { link, judul, pencipta, keterangan }) {
  const re = new RegExp(`(^|[\\s,{])${no}\\s*:\\s*\\{`, 'm');
  const m = re.exec(fileText);
  if (!m) throw new Error(`Entri lagu nomor ${no} tidak ditemukan di lagu.js`);

  const braceStart = fileText.indexOf('{', m.index);
  if (braceStart === -1) throw new Error(`Tidak ketemu "{" pembuka untuk lagu no.${no}`);
  const braceEnd = findMatchingBrace(fileText, braceStart);
  if (braceEnd === -1) throw new Error(`Tidak ketemu "}" penutup untuk lagu no.${no}`);

  let block = fileText.slice(braceStart, braceEnd + 1);
  if (link !== undefined) block = setStringField(block, 'link', link);
  if (judul !== undefined) block = setStringField(block, 'judul', judul);
  if (pencipta !== undefined) block = setStringField(block, 'pencipta', pencipta);
  if (keterangan !== undefined) block = setStringField(block, 'keterangan', keterangan);
  return fileText.slice(0, braceStart) + block + fileText.slice(braceEnd + 1);
}
