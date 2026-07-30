import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

export default function useKasPublik() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'kasKelas'), orderBy('tanggal', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => { console.warn('Realtime kasKelas:', err.message); setLoading(false); }
    );
    return unsub;
  }, []);

  const saldo = useMemo(
    () => list.reduce((acc, t) => acc + (t.tipe === 'masuk' ? t.jumlah : -t.jumlah), 0),
    [list]
  );

  // Rekap per siswa — cuma menghitung transaksi yang di-tag ke siswa tertentu
  // (siswaId terisi), transaksi umum/kas kelas tidak ikut direkap per orang.
  const rekapPerSiswa = useMemo(() => {
    const map = {};
    list.forEach((t) => {
      if (!t.siswaId) return;
      if (!map[t.siswaId]) map[t.siswaId] = { siswaNama: t.siswaNama, masuk: 0, keluar: 0 };
      if (t.tipe === 'masuk') map[t.siswaId].masuk += t.jumlah;
      else map[t.siswaId].keluar += t.jumlah;
    });
    return map;
  }, [list]);

  return { list, loading, saldo, rekapPerSiswa };
}
