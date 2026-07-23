import { useEffect, useRef } from 'react';
import { ImageIcon } from 'lucide-react';
import { FOTO } from '../data/foto.js';

export default function FotoKenangan() {
  const trackRef = useRef(null);
  const outerRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const outer = outerRef.current;
    if (!track || !outer) return;

    const cardW = 256; // 240px + 16px gap
    const singleSetW = FOTO.length * cardW;
    let offset = 0;
    let animRunning = true;
    let raf;

    function resetToStart() {
      if (offset <= -singleSetW) offset += singleSetW;
      if (offset > 0) offset = 0;
    }
    function applyOffset() {
      resetToStart();
      track.style.transform = `translateX(${offset}px)`;
    }
    function autoScroll() {
      if (animRunning) {
        offset -= 0.9; // px per frame
        applyOffset();
      }
      raf = requestAnimationFrame(autoScroll);
    }
    raf = requestAnimationFrame(autoScroll);

    // ── DRAG / TOUCH (mouse & jari) — bisa digeser manual, lalu meluncur
    // dengan momentum sebelum lanjut auto-scroll lagi ──
    let isDragging = false;
    let startX = 0;
    let startOffset = 0;
    let velX = 0;
    let lastX = 0;
    let lastT = 0;
    let coastRaf = null;

    function dragStart(x) {
      if (coastRaf) cancelAnimationFrame(coastRaf);
      isDragging = true;
      animRunning = false;
      startX = x;
      startOffset = offset;
      lastX = x;
      lastT = Date.now();
      outer.classList.add('dragging');
    }
    function dragMove(x) {
      if (!isDragging) return;
      const now = Date.now();
      velX = ((x - lastX) / Math.max(1, now - lastT)) * 16;
      lastX = x;
      lastT = now;
      offset = startOffset + (x - startX);
      applyOffset();
    }
    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      outer.classList.remove('dragging');
      let v = velX * 0.85;
      function coast() {
        v *= 0.92;
        offset += v;
        applyOffset();
        if (Math.abs(v) > 0.3) coastRaf = requestAnimationFrame(coast);
        else animRunning = true;
      }
      coastRaf = requestAnimationFrame(coast);
    }

    const onMouseDown = (e) => dragStart(e.clientX);
    const onMouseMove = (e) => dragMove(e.clientX);
    const onMouseUp = () => dragEnd();
    const onTouchStart = (e) => dragStart(e.touches[0].clientX);
    const onTouchMove = (e) => dragMove(e.touches[0].clientX);
    const onTouchEnd = () => dragEnd();

    outer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    outer.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(raf);
      if (coastRaf) cancelAnimationFrame(coastRaf);
      outer.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      outer.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const tripled = [...FOTO, ...FOTO, ...FOTO];

  return (
    <section className="section" id="foto">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Memories</p>
          <h2 className="section-title">Foto Kenangan</h2>
          <p className="section-sub">
            Momen-momen berharga yang pernah kita lewati bersama. Setiap foto menyimpan seribu cerita.
          </p>
        </div>
      </div>
      <div className="foto-outer" ref={outerRef}>
        <div className="foto-track" ref={trackRef}>
          {tripled.map((f, i) => (
            <div className="foto-card" key={i}>
              <div className="foto-img-wrap">
                {f.src ? (
                  <img src={f.src} alt={f.caption} loading="lazy" draggable={false} />
                ) : (
                  <div className="foto-placeholder">
                    <ImageIcon size={32} />
                    <span>{f.caption}</span>
                  </div>
                )}
                <div className="foto-overlay" />
              </div>
              <div className="foto-info">
                <div className="foto-caption">{f.caption}</div>
                <div className="foto-subdesc">{f.desc || 'XI TKJ 5 · 2026'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
