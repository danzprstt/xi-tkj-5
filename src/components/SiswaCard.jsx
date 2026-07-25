import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { getSiswaId, getPlaceholderDataUrl, getJabatan } from '../utils/helpers.js';
import { STRUKTUR } from '../data/struktur.js';
import ProtectedImage from './ProtectedImage.jsx';

export default function SiswaCard({ siswa, index, likeCount, isLiked, commentCount, onToggleLike, onCardClick, onCommentClick, gelembung, isPending }) {
  const sid = getSiswaId(siswa);
  const src = siswa.photo || getPlaceholderDataUrl(siswa.nama);
  const tags = getJabatan(STRUKTUR, siswa.nama);

  return (
    <div className="siswa-card reveal" onClick={() => onCardClick(index)}>
      {gelembung && (
        <div className="gelembung-mimpi">
          <span className="gelembung-mimpi-icon"><Sparkles size={12} /></span>
          <span className="gelembung-mimpi-text">{gelembung}</span>
        </div>
      )}
      <div className="siswa-photo">
        {tags.length > 0 && (
          <div className="siswa-tags">
            {tags.map((t) => <span className="siswa-tag" key={t}>{t}</span>)}
          </div>
        )}
        <ProtectedImage
          src={src}
          alt={siswa.nama || 'Foto siswa'}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getPlaceholderDataUrl(siswa.nama || 'Foto'); }}
        />
      </div>
      <div className="siswa-body">
        <div>
          <div className="siswa-no">No. {siswa.no || ''}</div>
          <div className="siswa-name">{siswa.nama || ''}</div>
        </div>
        <div className={'siswa-gender ' + (siswa.lp || '')} title={siswa.lp === 'L' ? 'Laki-laki' : 'Perempuan'}>
          {siswa.lp || ''}
        </div>
      </div>
      <div className="siswa-actions">
        <button
          className={'siswa-like-btn' + (isLiked ? ' liked' : '') + (isPending ? ' pending' : '')}
          onClick={(e) => { e.stopPropagation(); onToggleLike(sid); }}
          title="Suka"
        >
          <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="like-count">{likeCount || 0}</span>
        </button>
        <button
          className="siswa-comment-btn"
          onClick={(e) => { e.stopPropagation(); onCommentClick(index); }}
          title="Komentar"
        >
          <MessageCircle size={12} />
          <span className="comment-count">{commentCount || 0}</span>
        </button>
      </div>
    </div>
  );
}
