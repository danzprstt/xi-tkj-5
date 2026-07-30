import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

export default function usePengumumanPublik() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pengumuman'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => { console.warn('Realtime pengumuman:', err.message); setLoading(false); }
    );
    return unsub;
  }, []);

  return { list, loading };
}
