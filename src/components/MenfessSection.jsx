import { useState } from 'react';
import { Heart, Send } from 'lucide-react';
import useMenfess from '../hooks/useMenfess.js';
import useRateLimit from '../hooks/useRateLimit.js';

function formatWaktu(ms) {
  const diff = Date.now() - ms;
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return 'Baru saja';
  if (menit < 60) return menit + 'm lalu';
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + 'j lalu';
  const hari = Math.floor(jam / 24);
  return hari + 'h lalu';
}

const LIMIT_PER_HARI = 5;

export default function MenfessSection() {
  const { menfessMap, likedSet, kirimMenfess, toggleLikeMenfess } = useMenfess();
  const { sisa, bolehKirim, catatKirim } = useRateLimit('menfess_ratelimit', LIMIT_PER_HARI);
  const [teks, setTeks] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const items = Object.values(menfessMap).sort((a, b) => b.createdAtMs - a.createdAtMs);

  const handleKirim = async () => {
    if (!teks.trim()) return;
    if (!bolehKirim) {
      setStatus(`⚠ Sudah kirim ${LIMIT_PER_HARI}x hari ini. Coba lagi besok ya!`);
      return;
    }
    setSending(true);
    setStatus('Mengirim...');
    const res = await kirimMenfess(teks);
    setSending(false);
    if (res.ok) {
      catatKirim();
      setTeks('');
      setStatus('✓ Menfess terkirim secara anonim!');
      setTimeout(() => setStatus(''), 3000);
    } else if (res.error) {
      setStatus(res.error);
    }
  };

  return (
    <section className="section" id="menfess">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Anonim</p>
          <h2 className="section-title">Menfess</h2>
          <p className="section-sub">
            Mau curhat, ngaku dosa, atau kirim pesan rahasia ke temen sekelas? Tulis di sini — 100% anonim.
          </p>
        </div>

        <div className="menfess-form">
          <textarea
            placeholder="Tulis menfess kamu di sini... (anonim, maks 300 karakter)"
            maxLength={300}
            rows={3}
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
          />
          <div className="menfess-form-row">
            <span className="menfess-counter">{teks.length}/300 · sisa jatah hari ini: {sisa}/{LIMIT_PER_HARI}</span>
            <button className="menfess-send-btn" disabled={sending || !bolehKirim} onClick={handleKirim}>
              <Send size={14} /> Kirim Anonim
            </button>
          </div>
          {status && <div className="menfess-status">{status}</div>}
        </div>

        <div className="menfess-list">
          {items.length === 0 ? (
            <p className="popular-empty">Belum ada menfess. Jadilah yang pertama!</p>
          ) : (
            items.map((m) => {
              const liked = likedSet.has(m.id);
              return (
                <div className="menfess-item" key={m.id}>
                  <div className="menfess-item-top">
                    <span className="menfess-anon">🎭 Anonim</span>
                    <span className="menfess-time">{formatWaktu(m.createdAtMs)}</span>
                  </div>
                  <div className="menfess-text">{m.teks}</div>
                  <button
                    className={'menfess-like-btn' + (liked ? ' liked' : '')}
                    onClick={() => toggleLikeMenfess(m.id)}
                  >
                    <Heart size={13} fill={liked ? 'currentColor' : 'none'} /> {m.likes}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
