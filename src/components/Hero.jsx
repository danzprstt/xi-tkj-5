import { useEffect, useState } from 'react';

// Meniru timing dari heroEntrance() (anime.timeline) versi HTML lama:
// badge mulai di 0ms, lalu title/desc/stats/scroll menyusul dengan overlap
// negatif ('-=...'), sehingga hasil akhirnya kira-kira delay berikut:
const DELAY = { badge: 0, title: 250, desc: 570, stats: 750, scroll: 1030 };

function fadeStyle(show, delayMs) {
  return {
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s cubic-bezier(.33,1,.68,1) ${delayMs}ms, transform 0.6s cubic-bezier(.33,1,.68,1) ${delayMs}ms`,
  };
}

export default function Hero() {
  const [count, setCount] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // requestAnimationFrame ganda supaya browser sempat commit state opacity:0
    // dulu sebelum transisi ke opacity:1 dipicu (kalau langsung, transisinya di-skip).
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  useEffect(() => {
    let v = 0;
    const iv = setInterval(() => {
      v += 2;
      if (v >= 38) { v = 38; clearInterval(iv); }
      setCount(v);
    }, 30);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-inner">
        <div className="hero-badge" style={fadeStyle(entered, DELAY.badge)}>
          SMK Karya Bahana Mandiri 1
        </div>
        <h1 className="hero-title" style={fadeStyle(entered, DELAY.title)}>
          <span className="line1">Story of</span>
          <span className="line2">XI TKJ 5</span>
        </h1>
        <p className="hero-year" style={fadeStyle(entered, DELAY.title + 80)}>TAHUN PELAJARAN 2026 / 2027</p>
        <p className="hero-desc" style={fadeStyle(entered, DELAY.desc)}>
          Sebuah kisah tentang <em>38 jiwa</em> yang berjalan bersama — belajar, tertawa, berjuang, dan bertumbuh
          dalam satu ruang bernama <em>XI TKJ 5</em>. Ini bukan sekadar kelas. Ini adalah cerita kita.
        </p>
        <div className="hero-stats" style={fadeStyle(entered, DELAY.stats)}>
          <div className="hero-stat">
            <div className="hero-stat-num">{count}</div>
            <div className="hero-stat-lbl">Siswa</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">1</div>
            <div className="hero-stat-lbl">Wali Kelas</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">2026</div>
            <div className="hero-stat-lbl">Angkatan</div>
          </div>
        </div>
        <div className="hero-scroll" style={fadeStyle(entered, DELAY.scroll)}>
          <div className="hero-scroll-txt">scroll</div>
          <div className="hero-scroll-line"></div>
        </div>
      </div>
    </section>
  );
}
