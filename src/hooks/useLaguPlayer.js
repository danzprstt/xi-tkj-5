import { useRef, useState, useCallback, useEffect } from 'react';
import { lagu } from '../data/lagu.js';

export default function useLaguPlayer() {
  const audioRef = useRef(null);
  const [laguAktif, setLaguAktif] = useState(null); // entri lagu yang sedang aktif
  const [sedangMain, setSedangMain] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => { setSedangMain(true); setError(false); };
    const onPause = () => setSedangMain(false);
    const onError = () => { setSedangMain(false); setError(true); };
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('error', onError);
    };
  }, []);

  const putarUntukSiswa = useCallback((no) => {
    const player = audioRef.current;
    const entri = lagu[no];
    if (!player || !entri || !entri.link) {
      setLaguAktif(null);
      return;
    }
    setLaguAktif(entri);
    setError(false);
    player.pause();
    player.loop = true;
    player.src = entri.link;
    player.currentTime = 0;
    player.load();
    const p = player.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        console.warn('[lagu] Gagal memutar otomatis "' + entri.link + '":', err && err.name, err && err.message);
      });
    }
  }, []);

  const hentikan = useCallback(() => {
    const player = audioRef.current;
    if (!player) return;
    player.pause();
    player.currentTime = 0;
    setLaguAktif(null);
  }, []);

  const toggle = useCallback(() => {
    const player = audioRef.current;
    if (!player || !player.src) return;
    if (player.paused) {
      player.play().catch((err) => {
        console.warn('[lagu] Gagal memutar:', err && err.name, err && err.message);
      });
    } else {
      player.pause();
    }
  }, []);

  return { audioRef, laguAktif, sedangMain, error, putarUntukSiswa, hentikan, toggle };
}
