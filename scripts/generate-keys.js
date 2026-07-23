// Jalankan SEKALI secara lokal untuk generate kode edit unik tiap siswa:
//
//   node scripts/generate-keys.js
//
// Butuh file service-account.json (Firebase Console → Project Settings →
// Service Accounts → Generate new private key) ditaruh di root proyek ini
// (SUDAH ada di .gitignore, tidak akan ke-commit ke GitHub).
//
// Script ini akan:
//   1. Generate kode acak 6 karakter (huruf besar + angka) untuk tiap siswa
//   2. Simpan HASH-nya ke Firestore (koleksi `editKeys`)
//   3. Cetak daftar kode ASLI ke terminal + simpan ke keys-output.txt
//      (SIMPAN FILE INI BAIK-BAIK, lalu distribusikan manual ke tiap siswa —
//      setelah ini dijalankan, kode asli TIDAK BISA dilihat ulang, cuma
//      hash-nya yang tersimpan di Firestore)

import { readFileSync, writeFileSync } from 'fs';
import { createHash, randomInt } from 'crypto';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { SISWA } from '../src/data/siswa.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa 0/O/1/I biar gak ambigu dibaca

function buatKode() {
  let kode = '';
  for (let i = 0; i < 6; i++) kode += ALPHABET[randomInt(ALPHABET.length)];
  return kode;
}

function hashKey(key) {
  return createHash('sha256').update(key.trim().toUpperCase()).digest('hex');
}

async function main() {
  const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  const hasil = [];
  for (const s of SISWA) {
    const sid = 's' + s.no;
    const kode = buatKode();
    await db.collection('editKeys').doc(sid).set({
      keyHash: hashKey(kode),
      nama: s.nama,
      failedAttempts: 0,
      lockedUntil: null,
    });
    hasil.push({ no: s.no, nama: s.nama, sid, kode });
    console.log(`✓ ${sid}  ${s.nama.padEnd(30)}  KODE: ${kode}`);
  }

  const teks = hasil.map((h) => `No. ${h.no}\t${h.nama}\tKODE: ${h.kode}`).join('\n');
  writeFileSync('./keys-output.txt', teks, 'utf8');
  console.log('\nSelesai! Daftar lengkap juga disimpan ke keys-output.txt');
  console.log('⚠️  SIMPAN file ini baik-baik (jangan commit ke Git) lalu bagikan kode ke tiap siswa secara manual.');
}

main().catch((e) => { console.error(e); process.exit(1); });
