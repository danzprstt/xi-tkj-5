import { useEffect, useState } from 'react';

export const COUNTDOWN_TARGET = new Date('2027-01-01T07:00:00');
export const COUNTDOWN_LABEL = 'Menuju PKL ( Praktik Kerja Lapangan )';

function hitung() {
  const diff = COUNTDOWN_TARGET - new Date();
  if (diff <= 0) return { hari: 0, jam: 0, menit: 0, detik: 0 };
  return {
    hari: Math.floor(diff / 86400000),
    jam: Math.floor((diff / 3600000) % 24),
    menit: Math.floor((diff / 60000) % 60),
    detik: Math.floor((diff / 1000) % 60),
  };
}

export default function useCountdown() {
  const [sisa, setSisa] = useState(hitung);

  useEffect(() => {
    const iv = setInterval(() => setSisa(hitung()), 1000);
    return () => clearInterval(iv);
  }, []);

  return sisa;
}
