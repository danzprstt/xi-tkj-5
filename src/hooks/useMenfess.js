import { useEffect, useState, useCallback, useRef } from 'react';
import {
  collection, doc, addDoc, onSnapshot, orderBy, query,
  runTransaction, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { mengandungKataKasar } from '../utils/kataKasar.js';
import useLocalSet from './useLocalSet.js';

export default function useMenfess() {
  const [menfessMap, setMenfessMap] = useState({});
  const [likedSet, toggleLikedLocal] = useLocalSet('liked_menfess');

  // Kunci anti-dobel-klik: HARUS ref biasa yang diubah langsung (synchronous),
  // bukan derivasi dari React state — sama seperti fix di useSiswaLikes &
  // useKomentar, supaya tidak ada celah waktu buat klik beruntun nembus
  // sebelum kunci ini aktif (itu penyebab like ganda kalau di-spam klik).
  const pendingRef = useRef(new Set());
  const likedSetRef = useRef(likedSet);
  likedSetRef.current = likedSet;
  const [pendingUI, setPendingUI] = useState(() => new Set());

  useEffect(() => {
    const q = query(collection(db, 'menfess'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMenfessMap((prev) => {
          const next = { ...prev };
          snap.docChanges().forEach((change) => {
            const id = change.doc.id;
            if (change.type === 'removed') { delete next[id]; return; }
            const data = change.doc.data();
            next[id] = {
              id,
              teks: data.teks,
              likes: Math.max(0, data.likes || 0),
              createdAtMs: data.createdAt ? data.createdAt.toMillis() : Date.now(),
            };
          });
          return next;
        });
      },
      (err) => console.warn('Realtime menfess:', err.message)
    );
    return unsub;
  }, []);

  const kirimMenfess = useCallback(async (teks) => {
    const bersih = (teks || '').trim();
    if (!bersih) return { ok: false, error: '' };
    if (bersih.length > 300) return { ok: false, error: 'Maksimal 300 karakter ya.' };
    if (mengandungKataKasar(bersih)) {
      return { ok: false, error: '⚠ Menfess mengandung kata yang tidak pantas, coba tulis ulang.' };
    }
    try {
      await addDoc(collection(db, 'menfess'), {
        teks: bersih,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      return { ok: true };
    } catch (e) {
      console.error('Gagal kirim menfess:', e);
      return { ok: false, error: '⚠ Gagal mengirim — pastikan konfigurasi Firebase sudah benar.' };
    }
  }, []);

  const toggleLikeMenfess = useCallback((id) => {
    if (!id) return;
    if (pendingRef.current.has(id)) return; // klik susulan diabaikan total selama masih diproses
    pendingRef.current.add(id);
    setPendingUI(new Set(pendingRef.current));

    const sudahLikeSebelumnya = likedSetRef.current.has(id);

    // 1) Update tampilan instan (optimistic) — tidak menunggu server.
    toggleLikedLocal(id);
    setMenfessMap((prev) => {
      if (!prev[id]) return prev;
      const current = prev[id].likes || 0;
      const next = sudahLikeSebelumnya ? Math.max(0, current - 1) : current + 1;
      return { ...prev, [id]: { ...prev[id], likes: next } };
    });

    // 2) Simpan ke Firestore di latar belakang.
    const ref = doc(db, 'menfess', id);
    runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const current = snap.data().likes || 0;
      const next = sudahLikeSebelumnya ? Math.max(0, current - 1) : current + 1;
      tx.update(ref, { likes: next });
    })
      .catch((e) => {
        console.error('Gagal like menfess, membatalkan optimistic update:', e);
        toggleLikedLocal(id);
        setMenfessMap((prev) => {
          if (!prev[id]) return prev;
          const current = prev[id].likes || 0;
          const rollback = sudahLikeSebelumnya ? current + 1 : Math.max(0, current - 1);
          return { ...prev, [id]: { ...prev[id], likes: rollback } };
        });
      })
      .finally(() => {
        pendingRef.current.delete(id);
        setPendingUI(new Set(pendingRef.current));
      });
  }, [toggleLikedLocal]);

  return { menfessMap, likedSet, kirimMenfess, toggleLikeMenfess, pendingSet: pendingUI };
}
