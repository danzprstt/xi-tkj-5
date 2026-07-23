import { useEffect, useState, useCallback, useRef } from 'react';
import { collection, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import useLocalSet from './useLocalSet.js';

export default function useSiswaLikes() {
  const [counts, setCounts] = useState({}); // { sid: number }
  const [likedSet, toggleLikedLocal] = useLocalSet('liked_siswa');

  // PENTING: ini SUMBER KEBENARAN buat kunci anti-dobel-klik, dan HARUS berupa
  // ref biasa (bukan derivasi dari React state) supaya diubahnya BENAR-BENAR
  // instan/synchronous, tanpa nunggu siklus render. Kalau sebelumnya kunci ini
  // "diisi ulang" dari state tiap render (`pendingRef.current = pendingSet`),
  // ada celah waktu antara setState dipanggil dan React benar-benar re-render
  // — di celah itu klik susulan masih baca kunci yang LAMA (belum ke-set),
  // jadi tetap nembus dan nambah berkali-kali. Sekarang ref ini diubah
  // LANGSUNG di dalam handler, tanpa perantara state sama sekali.
  const pendingRef = useRef(new Set());
  const likedSetRef = useRef(likedSet);
  likedSetRef.current = likedSet;

  // State terpisah HANYA buat kebutuhan visual (efek denyut "pending"),
  // sengaja dipisah dari pendingRef supaya urusan tampilan tidak pernah
  // ikut memperlambat/mengganggu logika kunci yang sebenarnya.
  const [pendingUI, setPendingUI] = useState(() => new Set());

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

  const toggleLike = useCallback((sid) => {
    if (!sid) return;

    // Cek + kunci dalam SATU langkah synchronous — tidak ada celah waktu
    // sama sekali buat klik susulan nembus sebelum kunci ini aktif.
    if (pendingRef.current.has(sid)) return;
    pendingRef.current.add(sid);
    setPendingUI(new Set(pendingRef.current));

    const sudahLikeSebelumnya = likedSetRef.current.has(sid);

    // 1) Update tampilan instan (optimistic) — tidak menunggu server.
    toggleLikedLocal(sid);
    setCounts((prev) => {
      const current = prev[sid] || 0;
      const next = sudahLikeSebelumnya ? Math.max(0, current - 1) : current + 1;
      return { ...prev, [sid]: next };
    });

    // 2) Simpan ke Firestore di latar belakang.
    const ref = doc(db, 'siswaLikes', sid);
    runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const current = snap.exists() ? (snap.data().count || 0) : 0;
      const next = sudahLikeSebelumnya ? Math.max(0, current - 1) : current + 1;
      tx.set(ref, { count: next }, { merge: true });
    })
      .catch((e) => {
        console.error('Gagal like siswa, membatalkan optimistic update:', e);
        toggleLikedLocal(sid);
        setCounts((prev) => {
          const current = prev[sid] || 0;
          const rollback = sudahLikeSebelumnya ? current + 1 : Math.max(0, current - 1);
          return { ...prev, [sid]: rollback };
        });
      })
      .finally(() => {
        pendingRef.current.delete(sid);
        setPendingUI(new Set(pendingRef.current));
      });
  }, [toggleLikedLocal]);

  return { counts, likedSet, toggleLike, pendingSet: pendingUI };
}
