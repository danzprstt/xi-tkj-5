import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SISWA } from '../data/siswa.js';
import { getSiswaId } from '../utils/helpers.js';
import useReveal from '../hooks/useReveal.js';
import SiswaCard from './SiswaCard.jsx';

export default function SiswaSection({ likeCounts, likedSet, onToggleLike, komentarMap, onCardClick, onCommentClick, gelembungMimpi }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return SISWA;
    return SISWA.filter((s) => (s.nama || '').toLowerCase().includes(term));
  }, [q]);

  useReveal([filtered]);

  const commentCounts = useMemo(() => {
    const counts = {};
    Object.values(komentarMap).forEach((c) => {
      counts[c.siswaId] = (counts[c.siswaId] || 0) + 1;
    });
    return counts;
  }, [komentarMap]);

  return (
    <section className="section" id="siswa">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Anggota</p>
          <h2 className="section-title">Siswa XI TKJ 5</h2>
          <p className="section-sub">38 nama, 38 cerita, satu tujuan. Kenali satu per satu jiwa yang membentuk XI TKJ 5.</p>
          <div className="search-wrap">
            <Search size={16} />
            <input
              type="text"
              id="searchInput"
              placeholder="Cari nama siswa..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="search-count">
            {q ? `${filtered.length} hasil` : ''}
          </div>
        </div>
        <div className="siswa-grid">
          {filtered.map((s) => {
            const sid = getSiswaId(s);
            const realIndex = SISWA.indexOf(s);
            return (
              <SiswaCard
                key={sid}
                siswa={s}
                index={realIndex}
                likeCount={likeCounts[sid]}
                isLiked={likedSet.has(sid)}
                commentCount={commentCounts[sid]}
                onToggleLike={onToggleLike}
                onCardClick={onCardClick}
                onCommentClick={onCommentClick}
                gelembung={gelembungMimpi ? gelembungMimpi[sid] : undefined}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
