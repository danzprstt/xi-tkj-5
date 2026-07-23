import { useEffect, useMemo, useState } from 'react';
import { X, Heart } from 'lucide-react';
import { getPlaceholderDataUrl, getSiswaId } from '../utils/helpers.js';

function formatWaktuKomentar(ms) {
  const diff = Date.now() - ms;
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return 'Baru saja';
  if (menit < 60) return menit + 'm';
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + 'j';
  const hari = Math.floor(jam / 24);
  if (hari < 7) return hari + 'h';
  return Math.floor(hari / 7) + 'mgg';
}

function KomentarItem({ komentar, semua, isReply, likedSet, onLike, onReply, onHapus }) {
  const replies = semua.filter((k) => k.parentId === komentar.id).sort((a, b) => a.createdAtMs - b.createdAtMs);
  const liked = likedSet.has(komentar.id);
  const namaAman = komentar.nama || 'Anonim';

  return (
    <div className={'komentar-item' + (isReply ? ' komentar-reply' : '')}>
      <div className="komentar-avatar">{namaAman.charAt(0).toUpperCase()}</div>
      <div className="komentar-content">
        <div className="komentar-bubble">
          <span className="komentar-nama">{namaAman}</span>
          <span className="komentar-teks">{komentar.teks}</span>
        </div>
        <div className="komentar-actions">
          <span className="komentar-time">{formatWaktuKomentar(komentar.createdAtMs)}</span>
          <button className={'komentar-like-btn' + (liked ? ' liked' : '')} onClick={() => onLike(komentar.id)}>
            <Heart size={12} fill={liked ? 'currentColor' : 'none'} /> {komentar.likes || 0}
          </button>
          <button className="komentar-reply-btn" onClick={() => onReply(komentar.id, namaAman)}>Balas</button>
          <button className="komentar-del-btn" onClick={() => onHapus(komentar.id)}>Hapus</button>
        </div>
        {replies.length > 0 && (
          <div className="komentar-replies">
            {replies.map((r) => (
              <KomentarItem
                key={r.id} komentar={r} semua={semua} isReply
                likedSet={likedSet} onLike={onLike} onReply={onReply} onHapus={onHapus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KomentarModal({
  siswa, open, onClose,
  komentarMap, likedKomentarSet, kirimKomentar, toggleLikeKomentar, hapusKomentar,
  likeCounts, likedSet, onToggleLike,
}) {
  const [nama, setNama] = useState(() => localStorage.getItem('komentar_nama') || '');
  const [teks, setTeks] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // {id, nama}
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const sid = siswa ? getSiswaId(siswa) : null;

  useEffect(() => {
    setTeks('');
    setReplyTarget(null);
    setErr('');
  }, [sid]);

  const komentarSiswa = useMemo(() => {
    if (!sid) return [];
    return Object.values(komentarMap).filter((k) => k.siswaId === sid);
  }, [komentarMap, sid]);

  const topLevel = komentarSiswa.filter((k) => !k.parentId).sort((a, b) => a.createdAtMs - b.createdAtMs);

  if (!siswa) return null;

  const src = siswa.photo || getPlaceholderDataUrl(siswa.nama);
  const likeCount = likeCounts[sid] || 0;
  const isLiked = likedSet.has(sid);

  const handleKirim = async () => {
    setErr('');
    setSending(true);
    const res = await kirimKomentar({ sid, nama, teks, parentId: replyTarget?.id || null });
    setSending(false);
    if (res.ok) {
      setTeks('');
      setReplyTarget(null);
    } else if (res.error) {
      setErr(res.error);
    }
  };

  return (
    <div
      className={'siswa-lightbox' + (open ? ' open' : '')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="komentar-card">
        <button className="siswa-lightbox-close" onClick={onClose} aria-label="Tutup">
          <X size={18} />
        </button>

        <div className="komentar-card-header">
          <div className="komentar-card-avatar"><img src={src} alt="" /></div>
          <div>
            <div className="komentar-card-no">No. {siswa.no || ''}</div>
            <div className="komentar-card-name">{siswa.nama || ''}</div>
          </div>
        </div>

        <button className={'lightbox-like-btn' + (isLiked ? ' liked' : '')} onClick={() => onToggleLike(sid)}>
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span> suka
        </button>

        <div className="komentar-divider" />

        <div className="komentar-form">
          <input
            type="text" placeholder="Nama kamu (opsional)" maxLength={30}
            value={nama} onChange={(e) => setNama(e.target.value)}
          />
          {replyTarget && (
            <div className="komentar-reply-indicator" style={{ display: 'flex' }}>
              Membalas <span>@{replyTarget.nama}</span>
              <button onClick={() => setReplyTarget(null)}>✕</button>
            </div>
          )}
          <div className="komentar-input-row">
            <input
              type="text" placeholder="Tulis komentar..." maxLength={200}
              value={teks} onChange={(e) => setTeks(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleKirim(); }}
            />
            <button disabled={sending} onClick={handleKirim}>Kirim</button>
          </div>
          {err && <div style={{ color: '#ff5c7a', fontSize: '.68rem', marginTop: 6 }}>{err}</div>}
        </div>

        <div className="komentar-list">
          {topLevel.length === 0 ? (
            <p className="komentar-empty">Belum ada komentar. Jadilah yang pertama!</p>
          ) : (
            topLevel.map((k) => (
              <KomentarItem
                key={k.id} komentar={k} semua={komentarSiswa} isReply={false}
                likedSet={likedKomentarSet}
                onLike={toggleLikeKomentar}
                onReply={(id, nm) => setReplyTarget({ id, nama: nm })}
                onHapus={hapusKomentar}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
