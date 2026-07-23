import { useCallback, useState } from 'react';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function baca(storageKey) {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!raw || raw.tanggal !== todayKey()) return { tanggal: todayKey(), count: 0 };
    return raw;
  } catch {
    return { tanggal: todayKey(), count: 0 };
  }
}

/**
 * Rate limit sederhana per-browser, reset otomatis tiap gonta hari.
 * Dipakai buat batasi kirim pesan melayang max N kali/hari.
 */
export default function useRateLimit(storageKey, maxPerDay) {
  const [state, setState] = useState(() => baca(storageKey));

  const sisa = Math.max(0, maxPerDay - state.count);
  const bolehKirim = sisa > 0;

  const catatKirim = useCallback(() => {
    setState((prev) => {
      const now = baca(storageKey);
      const next = { tanggal: now.tanggal, count: now.count + 1 };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [storageKey]);

  return { sisa, maxPerDay, bolehKirim, catatKirim };
}
