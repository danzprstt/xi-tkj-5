import { useEffect, useState, useCallback, useRef } from 'react';
import {
  collection, doc, addDoc, deleteDoc, getDocs, writeBatch, onSnapshot,
  query, where, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { mengandungKataKasar } from '../utils/kataKasar.js';

export const MAKS_DURASI_MS = 30 * 24 * 60 * 60 * 1000; // 1 bulan — batas maksimum hangus

export default function usePesanMelayang(onPesanBaru) {
  const [pesanMap, setPesanMap] = useState({});
  const onPesanBaruRef = useRef(onPesanBaru);
  onPesanBaruRef.current = onPesanBaru;

  useEffect(() => {
    // Sama seperti versi lama: hanya subscribe pesan yang BELUM hangus, supaya
    // pesan lama yang sudah lewat expiresAt-nya tidak ikut spawn bubble melayang
    // lagi saat halaman pertama kali dibuka.
    const now = Timestamp.now();
    const q = query(collection(db, 'pesan'), where('expiresAt', '>', now), orderBy('expiresAt'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPesanMap((prev) => {
          const next = { ...prev };
          snap.docChanges().forEach((change) => {
            const id = change.doc.id;
            if (change.type === 'removed') {
              delete next[id];
              return;
            }
            const data = change.doc.data();
            const expiresAtMs = data.expiresAt ? data.expiresAt.toMillis() : Date.now();
            const createdAtMs = data.createdAt ? data.createdAt.toMillis() : Date.now();
            next[id] = { pesan: data.pesan, expiresAtMs, createdAtMs };
            if (change.type === 'added' && onPesanBaruRef.current) {
              onPesanBaruRef.current(id, data.pesan);
            }
          });
          return next;
        });
      },
      (err) => console.warn('Realtime pesan:', err.message)
    );
    return unsub;
  }, []);

  // Bersihkan dari state lokal pesan yang sudah hangus (mis. Firestore listener
  // belum sempat mengirim event 'removed'), dicek tiap 15 detik — meniru
  // tickCountdowns() di versi lama.
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setPesanMap((prev) => {
        const hangus = Object.entries(prev).filter(([, v]) => v.expiresAtMs <= now);
        if (!hangus.length) return prev;
        const next = { ...prev };
        hangus.forEach(([id]) => delete next[id]);
        return next;
      });
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  // Hapus permanen dokumen pesan yang sudah hangus dari Firestore, dicek tiap
  // 5 menit — meniru cleanupExpired() di versi lama, supaya database tidak
  // menumpuk pesan basi selamanya.
  useEffect(() => {
    async function cleanupExpired() {
      try {
        const now = Timestamp.now();
        const snap = await getDocs(query(collection(db, 'pesan'), where('expiresAt', '<=', now)));
        if (snap.empty) return;
        const batch = writeBatch(db);
        snap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (e) {
        console.warn('Cleanup pesan gagal (boleh diabaikan):', e.message);
      }
    }
    cleanupExpired();
    const iv = setInterval(cleanupExpired, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const kirimPesan = useCallback(async (teks, durasiMsInput) => {
    const bersih = (teks || '').trim();
    if (!bersih) return { ok: false, error: '' };
    if (mengandungKataKasar(bersih)) {
      return { ok: false, error: '⚠ Pesan mengandung kata yang tidak pantas, coba tulis ulang ya.' };
    }
    let durasiMs = Number(durasiMsInput) || MAKS_DURASI_MS;
    if (durasiMs > MAKS_DURASI_MS) durasiMs = MAKS_DURASI_MS; // hard cap 1 bulan

    try {
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + durasiMs);
      await addDoc(collection(db, 'pesan'), {
        pesan: bersih,
        createdAt: serverTimestamp(),
        expiresAt,
      });
      return { ok: true };
    } catch (e) {
      console.error('Gagal kirim pesan:', e);
      return { ok: false, error: '⚠ Gagal mengirim — pastikan konfigurasi Firebase sudah benar.' };
    }
  }, []);

  const hapusPesan = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'pesan', id));
    } catch (e) {
      console.error('Gagal hapus pesan:', e);
    }
  }, []);

  return { pesanMap, kirimPesan, hapusPesan };
}
