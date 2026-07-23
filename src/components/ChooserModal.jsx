import { X, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { getPlaceholderDataUrl } from '../utils/helpers.js';

export default function ChooserModal({ siswa, open, onClose, onPilihKomentar, onPilihFoto }) {
  if (!siswa) return null;
  const src = siswa.photo || getPlaceholderDataUrl(siswa.nama);

  return (
    <div
      className={'siswa-lightbox' + (open ? ' open' : '')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="chooser-card">
        <button className="siswa-lightbox-close" onClick={onClose} aria-label="Tutup">
          <X size={18} />
        </button>
        <div className="chooser-avatar"><img src={src} alt="" /></div>
        <div className="chooser-name">{siswa.nama}</div>
        <div className="chooser-actions">
          <button className="chooser-btn" onClick={onPilihKomentar}>
            <MessageCircle size={16} /> Komentar
          </button>
          <button className="chooser-btn primary" onClick={onPilihFoto}>
            <ImageIcon size={16} /> Lihat Gambar
          </button>
        </div>
      </div>
    </div>
  );
}
