// Jalankan SEKALI secara lokal untuk generate kode akses pengurus kelas:
//
//   node scripts/generate-officer-keys.js
//
// Butuh file service-account.json yang SAMA seperti generate-keys.js
// (lihat README.md bagian setup fitur edit profil).
//
// Ini akan generate kode buat 4 role: ketua, wakil, sekretaris, bendahara.
// Kode-kode ini dipakai buat login ke halaman privat /private-pr-kelas.

import { readFileSync, writeFileSync } from 'fs';
import { createHash, randomInt } from 'crypto';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa 0/O/1/I biar gak ambigu dibaca

const ROLES = [
  { id: 'ketua', label: 'Ketua Kelas' },
  { id: 'wakil', label: 'Wakil Ketua Kelas' },
  { id: 'sekretaris', label: 'Sekretaris' },
  { id: 'bendahara', label: 'Bendahara' },
];

function buatKode() {
  let kode = '';
  for (let i = 0; i < 8; i++) kode += ALPHABET[randomInt(ALPHABET.length)]; // 8 karakter, lebih panjang dari kode siswa (edit profil kelas lebih sensitif)
  return kode;
}

function hashKey(key) {
  return createHash('sha256').update(key.trim().toUpperCase()).digest('hex');
}

async function main() {
  const path = './service-account.json';
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    console.error(`\n❌ File "${path}" tidak ditemukan. Lihat README.md untuk cara download-nya.\n`);
    process.exit(1);
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (e) {
    console.error(`\n❌ File "${path}" bukan JSON yang valid (${e.message}).\n`);
    process.exit(1);
  }

  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  const hasil = [];
  for (const r of ROLES) {
    const kode = buatKode();
    await db.collection('officerKeys').doc(r.id).set({
      keyHash: hashKey(kode),
      nama: r.label,
      failedAttempts: 0,
      lockedUntil: null,
    });
    hasil.push({ role: r.id, label: r.label, kode });
    console.log(`✓ ${r.id.padEnd(12)} ${r.label.padEnd(22)} KODE: ${kode}`);
  }

  const teks = hasil.map((h) => `${h.label} (${h.role})\tKODE: ${h.kode}`).join('\n');
  writeFileSync('./officer-keys-output.txt', teks, 'utf8');
  console.log('\nSelesai! Daftar lengkap juga disimpan ke officer-keys-output.txt');
  console.log('⚠️  SIMPAN file ini baik-baik (jangan commit ke Git) lalu bagikan kode ke masing-masing pengurus secara personal.');
  console.log('    Kode ini dipakai buat login ke halaman /private-pr-kelas.');
}

main().catch((e) => { console.error(e); process.exit(1); });
