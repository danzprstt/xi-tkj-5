import { useEffect, useState, useCallback } from 'react';
import { collection, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import useLocalSet from './useLocalSet.js';

export default function useSiswaLikes() {
  const [counts, setCounts] = useState({}); // { sid: number }
  const [likedSet, toggleLikedLocal] = useLocalSet('liked_siswa');

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'siswaLikes'),
      (snap) => {
        setCounts((prev) => {
          const next = { ...prev };
          snap.docChanges().forEach((change) => {
            if (change.type === 'removed') delete next[change.doc.id];
            else next[change.doc.id] = Math.max(0, change.doc.data().count || 0);
          });
          return next;
        });
      },
      (err) => console.warn('Realtime siswaLikes:', err.message)
    );
    return unsub;
  }, []);

  const toggleLike = useCallback(
    async (sid) => {
      if (!sid) return;
      const sudahLike = likedSet.has(sid);
      const ref = doc(db, 'siswaLikes', sid);
      try {
        // Pakai transaction (bukan increment mentah) supaya count TIDAK PERNAH
        // bisa nembus di bawah 0 — kalau status "liked" lokal desync dari data
        // asli di Firestore (mis. localStorage kehapus / beda browser / beda
        // device), unlike tetap aman: minimal jadi 0, tidak pernah minus.
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          const current = snap.exists() ? (snap.data().count || 0) : 0;
          const next = sudahLike ? Math.max(0, current - 1) : current + 1;
          tx.set(ref, { count: next }, { merge: true });
        });
        toggleLikedLocal(sid);
      } catch (e) {
        console.error('Gagal like siswa:', e);
      }
    },
    [likedSet, toggleLikedLocal]
  );

  return { counts, likedSet, toggleLike };
}
