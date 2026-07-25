import { useEffect, useState } from 'react';
import { X, Download, Share2, ChevronLeft, ChevronRight, Grid3x3 } from 'lucide-react';
import { FOTO } from '../data/foto.js';

function unduhFoto(src, caption) {
  const a = document.createElement('a');
  a.href = src;
  a.download = (caption || 'foto-kenangan').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.jpg';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function bagikanFoto(src, caption) {
  try {
    if (navigator.share) {
      // Coba share sebagai file kalau browser mendukung (Web Share API level 2)
      try {
        const resp = await fetch(src);
        const blob = await resp.blob();
        const file = new File([blob], 'foto-kenangan.jpg', { type: blob.type || 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: caption, text: `${caption} — XI TKJ 5` });
          return;
        }
      } catch { /* fallback ke share link biasa di bawah */ }
      await navigator.share({ title: caption, text: `${caption} — XI TKJ 5`, url: window.location.href });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link halaman disalin ke clipboard (browser kamu belum mendukung fitur bagikan langsung).');
    }
  } catch {
    /* pengguna membatalkan share sheet — tidak perlu ditangani */
  }
}

export default function FotoFullscreenModal({ mode, activeIndex, onClose, onOpenSingle, onNavigate }) {
  const [imgIndex, setImgIndex] = useState(activeIndex || 0);

  useEffect(() => { setImgIndex(activeIndex || 0); }, [activeIndex]);

  useEffect(() => {
    if (mode === 'none') return undefined;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [mode]);

  useEffect(() => {
    function onKey(e) {
      if (mode !== 'single') return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, onClose, onNavigate]);

  if (mode === 'none') return null;

  if (mode === 'grid') {
    return (
      <div className="foto-fullscreen-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="foto-grid-header">
          <h3><Grid3x3 size={16} /> Semua Foto Kenangan</h3>
          <button className="foto-fullscreen-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="foto-grid-wrap">
          {FOTO.map((f, i) => (
            <button className="foto-grid-item" key={i} onClick={() => onOpenSingle(i)}>
              {f.src ? <img src={f.src} alt={f.caption} loading="lazy" draggable={false} /> : <div className="foto-placeholder-mini">{f.caption}</div>}
              <span className="foto-grid-item-caption">{f.caption}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // mode === 'single'
  const f = FOTO[imgIndex];
  if (!f) return null;

  return (
    <div className="foto-fullscreen-overlay foto-fullscreen-single" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="foto-single-toolbar">
        <button onClick={() => onOpenSingle(null, true)} title="Kembali ke grid"><Grid3x3 size={16} /></button>
        <span className="foto-single-count">{imgIndex + 1} / {FOTO.length}</span>
        <div className="foto-single-actions">
          {f.src && (
            <>
              <button onClick={() => unduhFoto(f.src, f.caption)} title="Unduh"><Download size={16} /></button>
              <button onClick={() => bagikanFoto(f.src, f.caption)} title="Bagikan"><Share2 size={16} /></button>
            </>
          )}
          <button onClick={onClose} title="Tutup"><X size={18} /></button>
        </div>
      </div>

      <button className="foto-single-nav prev" onClick={() => onNavigate(-1)} aria-label="Sebelumnya">
        <ChevronLeft size={26} />
      </button>
      <div className="foto-single-imgwrap">
        {f.src
          ? <img src={f.src} alt={f.caption} draggable={false} />
          : <div className="foto-placeholder-big">{f.caption}</div>}
      </div>
      <button className="foto-single-nav next" onClick={() => onNavigate(1)} aria-label="Berikutnya">
        <ChevronRight size={26} />
      </button>

      <div className="foto-single-caption">
        <div className="foto-single-title">{f.caption}</div>
        <div className="foto-single-desc">{f.desc || 'XI TKJ 5 · 2026'}</div>
      </div>
    </div>
  );
}
