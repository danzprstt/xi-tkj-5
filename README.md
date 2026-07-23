# XI TKJ 5 — React (Vite + JSX)

Hasil migrasi dari `index_7_.html` (single-file) ke proyek React modular.
Ini adalah **Fase 1: migrasi murni** — fungsionalitas & tampilan dibuat sefaithful
mungkin ke versi HTML sebelumnya. Fitur-fitur baru (edit profile+OTP+GitHub, hapus
Google Search, jadwal mapel, papan terpopuler, gelembung mimpi, menfess) **belum**
ada di sini — itu dikerjakan di fase berikutnya, di atas fondasi ini.

## Menjalankan di lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build produksi

```bash
npm run build
```

Hasil build ada di folder `dist/`, tinggal di-deploy ke Vercel seperti biasa
(atau `vercel --prod` kalau sudah connect CLI-nya).

## Environment variables

Config Firebase ada di `.env` (sudah saya isi otomatis dari konfigurasi lama kamu,
tinggal pakai). Kalau deploy ke Vercel, masukkan juga variabel yang sama di
**Project Settings → Environment Variables**:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

> **Catatan penting:** API key Firebase ini AMAN untuk ada di kode client —
> beda total dengan GitHub token. Keamanan Firebase-nya ada di Firestore
> Security Rules (lihat bawah), bukan dengan menyembunyikan key ini.

## ⚠️ Wajib: taruh file media di folder `public/`

Vite **tidak otomatis membaca file di luar proyek**. Semua foto & lagu harus
ditaruh di folder `public/` (bukan di `src/`), dengan struktur persis begini:

```
public/
  paimam.png          ← foto wali kelas
  audio.mp3            ← musik latar (bg music)
  thumbnail.jpg        ← cover musik latar
  siswa_i/
    ada.jpg, agus.jpg, dst...   ← foto tiap siswa
  lagu/
    1.mp3, agus.mp3, dst...     ← lagu tiap siswa (lihat src/data/lagu.js)
  memory/
    img1.jpg, img2.jpg, dst...  ← foto kenangan
```

Semua path di `src/data/siswa.js`, `src/data/lagu.js`, `src/data/foto.js`
sudah saya ubah dari `./siswa_i/...` (relatif, cara HTML biasa) menjadi
`/siswa_i/...` (absolut dari root, cara Vite membaca folder `public/`).
File apa pun di `public/` otomatis ikut ter-deploy saat `npm run build` —
sudah saya tes, terbukti muncul di `dist/`.

Ada file `PUT_..._HERE.txt` di tiap subfolder sebagai penanda — hapus saja
kalau foldernya sudah kamu isi file asli.

## Bug yang baru diperbaiki (setelah migrasi awal)

1. **Hero & struktur organisasi blank/transparan** — animasi entrance
   (`heroEntrance()` dan animasi stagger tree-node) kelewat saat migrasi,
   sekarang sudah ditambahkan lagi di `Hero.jsx` & `StrukturTree.jsx`.
2. **Kolom search & pesan tidak ke-styling** — CSS asli pakai selector ID
   (`#searchInput`, `#pesanInput`), bukan class; id-nya sekarang sudah
   ditambahkan lagi di JSX.
3. **Like bisa minus** — diganti dari `increment()` mentah ke Firestore
   *transaction* yang tidak pernah membiarkan angka di bawah 0, plus rules
   Firestore diperketat (lihat bawah).
4. **Background masih bisa di-scroll saat modal terbuka** — `document.body.style.overflow`
   sekarang dikunci otomatis (lewat `useEffect` di `App.jsx`) tiap ada modal
   (chooser/foto/komentar) yang terbuka.
5. **Path media (`./siswa_i/...`, `./lagu/...`, `./memory/...`) tidak kebaca**
   — lihat bagian folder `public/` di atas.
6. **Pesan melayang**: sekarang query Firestore-nya difilter persis seperti versi
   lama (`where('expiresAt','>',now)`) supaya pesan yang sudah lewat tanggal
   hangus tidak ikut nge-bubble saat halaman pertama dibuka; teks "Hangus
   dlm..." juga sekarang ikut update tiap 15 detik; dan pesan yang sudah
   hangus otomatis dihapus dari Firestore tiap 5 menit (menyamai
   `cleanupExpired()` versi lama).

## Perbaikan & fitur baru (update terakhir)

1. **Lagu tidak autoplay saat "Lihat Gambar"** — akar masalahnya bukan soal
   diblokir browser, tapi elemen `<audio>` di `PhotoModal.jsx` ternyata ikut
   remount (posisinya di JSX berubah tergantung ada/tidaknya siswa terpilih),
   sehingga `.play()` sempat kepanggil ke elemen yang lama sebelum React
   membuang elemen itu dan bikin yang baru. Sekarang elemen `<audio>` selalu
   di posisi tetap, tidak pernah ikut remount.
2. **Foto Kenangan sekarang bisa digeser manual** (drag mouse / swipe jari),
   lengkap dengan momentum saat dilepas sebelum lanjut auto-scroll lagi —
   port langsung dari logic drag/touch versi HTML lama yang sebelumnya
   sengaja saya skip demi kecepatan migrasi.
3. **Jadwal Mapel** — section baru di bawah Piket (`src/data/jadwalMapel.js`
   + `src/components/JadwalMapel.jsx`), isinya masih data contoh/placeholder.
   Tinggal edit `src/data/jadwalMapel.js` untuk isi jam, nama mapel, dan guru
   yang sebenarnya per hari.

## Struktur folder

```
src/
  data/         SISWA, STRUKTUR, FOTO, PIKET, LINKS, lagu (per siswa), KATA_KASAR, icons
  hooks/        useCountdown, useSiswaLikes, useKomentar, usePesanMelayang,
                useLaguPlayer, useLocalSet, useReveal
  utils/        kataKasar (filter), helpers (getSiswaId, placeholder foto, dll)
  lib/          firebase.js (init modular SDK)
  components/   satu file per bagian halaman
  styles/       global.css (CSS asli disalin utuh, tidak ditulis ulang)
  App.jsx       orkestrasi state modal (chooser/foto/komentar) & layout halaman
  main.jsx      entry point
```

Data siswa/lagu/piket/dll semuanya jadi file terpisah di `src/data/` — jadi kalau
mau update satu siswa, foto, atau lagu, tinggal edit file kecil yang relevan,
tidak perlu scroll ribuan baris seperti di file HTML lama.

## Yang disederhanakan saat migrasi (silakan bilang kalau mau ditambah lagi)

Beberapa efek visual dekoratif di versi HTML lama butuh reimplementasi lumayan
kompleks di React, jadi saya skip dulu demi kecepatan migrasi:

- **Drag/swipe manual** di carousel Foto Kenangan (auto-scroll-nya tetap jalan,
  cuma interaksi tarik-manual pakai mouse/jari belum ada).
- **Garis penghubung horizontal** antar-card di tree Struktur Kelas (kalau ada
  lebih dari 1 orang di satu level jabatan) — layout tree-nya tetap sama, cuma
  garis dekoratif penghubungnya belum diukur ulang otomatis.

Semua fungsionalitas inti (Firebase realtime, like, komentar+reply, pesan
melayang, lagu per siswa, search, countdown, dll) **sudah full jalan**, sudah
saya `npm run build` dan lolos tanpa error.

## Google Custom Search dihapus

Section "Penelusuran" (Google Custom Search Engine) yang ada di HTML lama
**tidak saya ikut migrasikan**, karena itu memang salah satu fitur yang mau
dihapus (poin #3 di daftar update kamu) — jadi saya langsung skip daripada
migrasi lalu dihapus lagi.

## Firestore Security Rules (Firebase Console → Firestore Database → Rules)

Ini persis rules yang terakhir aktif di versi HTML kamu — tidak ada perubahan,
copy-paste langsung kalau rules kamu di Console belum sinkron:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pesan/{id} {
      allow read: if true;
      allow create: if request.resource.data.pesan is string
        && request.resource.data.pesan.size() > 0
        && request.resource.data.pesan.size() <= 100
        && request.resource.data.expiresAt is timestamp
        && request.resource.data.expiresAt <= request.time + duration.value(31, 'd');
      allow delete: if true;
      allow update: if false;
    }

    match /siswaLikes/{id} {
      allow read: if true;
      allow write: if request.resource.data.count is int
        && request.resource.data.count >= 0;
    }

    match /siswaKomentar/{id} {
      allow read: if true;
      allow create: if request.resource.data.siswaId is string
        && request.resource.data.nama is string
        && request.resource.data.nama.size() <= 30
        && request.resource.data.teks is string
        && request.resource.data.teks.size() > 0
        && request.resource.data.teks.size() <= 200
        && request.resource.data.likes == 0;
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes'])
        && request.resource.data.likes is int
        && request.resource.data.likes >= 0;
      allow delete: if true;
    }

    match /menfess/{id} {
      allow read: if true;
      allow create: if request.resource.data.teks is string
        && request.resource.data.teks.size() > 0
        && request.resource.data.teks.size() <= 300
        && request.resource.data.likes == 0;
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes'])
        && request.resource.data.likes is int
        && request.resource.data.likes >= 0;
      allow delete: if true;
    }

    // Kode edit tiap siswa (hash-nya saja) — TIDAK BOLEH dibaca/ditulis dari
    // client sama sekali. Hanya serverless function (Firebase Admin SDK,
    // pakai service account) yang boleh akses koleksi ini, dan Admin SDK
    // otomatis melewati rules ini sepenuhnya.
    match /editKeys/{id} {
      allow read, write: if false;
    }

    // Gelembung mimpi: boleh dibaca semua orang (buat ditampilkan di kartu
    // siswa), tapi HANYA boleh ditulis lewat serverless function (/api/gelembung)
    // yang sudah verifikasi kode edit siswa itu duluan — bukan langsung dari client.
    match /gelembungMimpi/{id} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 🔐 Fitur Edit Profil (`/edit-dengan-keamanan-key`)

Halaman ini memungkinkan tiap siswa mengedit **foto, file lagu, judul/pencipta/
keterangan lagu, dan "gelembung mimpi"** mereka sendiri, terkunci pakai kode
unik per-siswa (bukan password admin bersama). Perubahan foto & lagu di-commit
langsung ke repo GitHub `danzprstt/x-tkj-4` lewat serverless function di
folder `api/` — **token GitHub tidak pernah ada di kode client**.

### Environment variables yang WAJIB ditambah di Vercel

Selain 6 variabel `VITE_FIREBASE_*` yang sudah ada, tambahkan ini di
**Vercel → Project Settings → Environment Variables** (server-side, jangan
pakai prefix `VITE_` supaya tidak ke-bundle ke client):

| Nama | Isi |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Isi JSON lengkap service account (lihat langkah 1 di bawah), sebagai satu baris string |
| `GITHUB_TOKEN` | Personal Access Token GitHub, scope **repo** (Settings → Developer settings → Fine-grained/Classic tokens) |
| `GITHUB_OWNER` | `danzprstt` |
| `GITHUB_REPO` | `x-tkj-4` |
| `GITHUB_BRANCH` | `main` (atau branch default repo kamu) |
| `SESSION_SECRET` | String acak panjang bebas (buat tanda tangan token sesi edit) — generate sendiri, contoh: `openssl rand -hex 32` |

### Langkah-langkah setup (dari nol)

1. **Buat Service Account Firebase** (buat serverless function baca/tulis
   Firestore tanpa dibatasi Security Rules):
   Firebase Console → ⚙️ Project Settings → tab **Service Accounts** →
   **Generate new private key** → file JSON ke-download. **Ini rahasia**,
   jangan pernah commit ke Git.

2. **Isi env var di Vercel** sesuai tabel di atas (`FIREBASE_SERVICE_ACCOUNT`
   isinya seluruh isi file JSON tadi, di-paste sebagai satu baris).

3. **Generate kode edit tiap siswa** (dijalankan sekali, secara lokal di
   komputer kamu, BUKAN di Vercel):
   ```bash
   # taruh file JSON service account dari langkah 1 di root proyek,
   # namai persis: service-account.json
   npm install
   node scripts/generate-keys.js
   ```
   Ini akan mencetak 38 kode (satu per siswa) ke terminal DAN menyimpannya ke
   `keys-output.txt`. **Simpan file ini baik-baik**, lalu bagikan tiap kode
   ke siswa yang bersangkutan (personal chat/WA, jangan disebar di grup).
   Kode aslinya tidak akan pernah bisa dilihat ulang setelah ini — yang
   tersimpan di Firestore cuma hash-nya.

4. **Deploy ke Vercel** seperti biasa. Sekarang siswa bisa buka
   `https://xi-tkj-5.vercel.app/edit-dengan-keamanan-key`, pilih namanya,
   masukkan kode, dan edit foto/lagu/gelembung mimpi masing-masing.

### Cara kerja keamanannya (ringkas)

- Kode tiap siswa di-hash (SHA-256) sebelum disimpan — Firestore rules
  (`editKeys`) menutup total akses baca/tulis dari client, cuma serverless
  function yang boleh baca lewat Firebase Admin SDK.
- Verifikasi kode dibatasi **5x percobaan salah**, lalu terkunci 15 menit
  (mencegah brute-force).
- Kode yang benar mengeluarkan token sesi (berlaku 30 menit, ditandatangani
  `SESSION_SECRET`) yang mengunci sesi itu HANYA untuk siswa tsb — token
  siswa A tidak bisa dipakai edit profil siswa B.
- Edit foto/lagu memicu commit ke GitHub → Vercel otomatis build & deploy
  ulang (biasanya makan waktu 1-3 menit sebelum perubahan terlihat live).
- Edit gelembung mimpi langsung tersimpan di Firestore (realtime, tanpa
  perlu nunggu rebuild), karena itu cuma teks, bukan file.

## Status daftar update (per fitur)

1. ✅ Edit profile `/edit-dengan-keamanan-key` — selesai (lihat bagian di atas)
2. ✅ Filter kata kasar — aktif di komentar, pesan, dan menfess
3. ✅ Google Custom Search — dihapus (tidak ikut dimigrasi)
4. ✅ Jadwal mapel (jam + guru) — section baru di bawah Piket
5. ✅ Papan nama terpopuler (like + komentar) — section baru setelah daftar siswa
6. ✅ Verifikasi kode custom per-siswa (6 karakter) — lihat bagian Fitur Edit Profil
7. ✅ Halaman edit dengan pilihan card → verifikasi kode → form edit + gelembung mimpi
8. ✅ Menfess — section baru, papan konfesi anonim
9. ✅ Limit pesan melayang 3x/hari — sudah aktif di section "Tinggalkan Pesan"

**Belum sempat digarap / bisa ditambah kalau perlu:**
- Halaman admin untuk generate ulang / cabut kode edit siswa tertentu tanpa
  harus jalankan script lokal lagi
- Notifikasi ke siswa kalau editnya berhasil di-deploy (saat ini cuma pesan
  "akan live dalam 1-3 menit" tanpa konfirmasi otomatis)
