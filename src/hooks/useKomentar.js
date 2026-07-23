import { useEffect, useState, useCallback } from 'react';
import {
  collection, doc, addDoc, deleteDoc, writeBatch,
  onSnapshot, orderBy, query, runTransaction, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import useLocalSet from './useLocalSet.js';
import { mengandungKataKasar } from '../utils/kataKasar.js';

export default function useKomentar() {
  const [komentarMap, setKomentarMap] = useState({}); // id -> komentar
  const [likedKomentarSet, toggleLikedLocal] = useLocalSet('liked_komentar');

  useEffect(() => {
    const q = query(collection(db, 'siswaKomentar'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setKomentarMap((prev) => {
          const next = { ...prev };
          snap.docChanges().forEach((change) => {
            const id = change.doc.id;
            if (change.type === 'removed') {
              delete next[id];
            } else {
              const data = change.doc.data();
              next[id] = {
                id,
                siswaId: data.siswaId,
                nama: data.nama,
                teks: data.teks,
                parentId: data.parentId || null,
                likes: Math.max(0, data.likes || 0),
                createdAtMs: data.createdAt ? data.createdAt.toMillis() : Date.now(),
              };
            }
          });
          return next;
        });
      },
      (err) => console.warn('Realtime siswaKomentar:', err.message)
    );
    return unsub;
  }, []);

  const kirimKomentar = useCallback(async ({ sid, nama, teks, parentId }) => {
    const namaBersih = (nama || '').trim().slice(0, 30) || 'Anonim';
    const teksBersih = (teks || '').trim();
    if (!sid || !teksBersih) return { ok: false, error: 'Komentar kosong.' };
    if (mengandungKataKasar(namaBersih) || mengandungKataKasar(teksBersih)) {
      return { ok: false, error: 'Komentar atau nama mengandung kata yang tidak pantas. Yuk pakai kata-kata yang lebih sopan 🙏' };
    }
    try {
      await addDoc(collection(db, 'siswaKomentar'), {
        siswaId: sid,
        nama: namaBersih,
        teks: teksBersih,
        parentId: parentId || null,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      try { localStorage.setItem('komentar_nama', namaBersih); } catch { /* ignore */ }
      return { ok: true };
    } catch (e) {
      console.error('Gagal kirim komentar:', e);
      return { ok: false, error: 'Gagal mengirim komentar — pastikan konfigurasi Firebase sudah benar.' };
    }
  }, []);

  const toggleLikeKomentar = useCallback(
    async (id) => {
      const sudahLike = likedKomentarSet.has(id);
      const ref = doc(db, 'siswaKomentar', id);
      try {
        // Sama seperti like siswa: pakai transaction supaya likes komentar
        // juga tidak pernah bisa nembus di bawah 0.
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          if (!snap.exists()) return;
          const current = snap.data().likes || 0;
          const next = sudahLike ? Math.max(0, current - 1) : current + 1;
          tx.update(ref, { likes: next });
        });
        toggleLikedLocal(id);
      } catch (e) {
        console.error('Gagal like komentar:', e);
      }
    },
    [likedKomentarSet, toggleLikedLocal]
  );

  const hapusKomentar = useCallback(
    async (id) => {
      if (!confirm('Hapus komentar ini? Balasannya juga akan terhapus.')) return;
      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'siswaKomentar', id));
        Object.values(komentarMap)
          .filter((k) => k.parentId === id)
          .forEach((r) => batch.delete(doc(db, 'siswaKomentar', r.id)));
        await batch.commit();
      } catch (e) {
        console.error('Gagal hapus komentar:', e);
      }
    },
    [komentarMap]
  );

  return { komentarMap, likedKomentarSet, kirimKomentar, toggleLikeKomentar, hapusKomentar };
}
