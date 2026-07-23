import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

export default function useGelembungMimpi() {
  const [data, setData] = useState({}); // { sid: teks }

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'gelembungMimpi'),
      (snap) => {
        setData((prev) => {
          const next = { ...prev };
          snap.docChanges().forEach((change) => {
            if (change.type === 'removed') delete next[change.doc.id];
            else next[change.doc.id] = change.doc.data().teks;
          });
          return next;
        });
      },
      (err) => console.warn('Realtime gelembungMimpi:', err.message)
    );
    return unsub;
  }, []);

  return data;
}
