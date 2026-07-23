import { useMemo } from 'react';
import { Trophy, Heart, MessageCircle } from 'lucide-react';
import { SISWA } from '../data/siswa.js';
import { getSiswaId, getPlaceholderDataUrl } from '../utils/helpers.js';

const MEDALI = ['🥇', '🥈', '🥉'];

export default function PapanTerpopuler({ likeCounts, komentarMap }) {
  const ranking = useMemo(() => {
    const commentCounts = {};
    Object.values(komentarMap).forEach((c) => {
      commentCounts[c.siswaId] = (commentCounts[c.siswaId] || 0) + 1;
    });

    return SISWA.map((s) => {
      const sid = getSiswaId(s);
      const like = likeCounts[sid] || 0;
      const komen = commentCounts[sid] || 0;
      return { siswa: s, sid, like, komen, skor: like + komen };
    })
      .filter((r) => r.skor > 0)
      .sort((a, b) => b.skor - a.skor)
      .slice(0, 10);
  }, [likeCounts, komentarMap]);

  return (
    <section className="section" id="terpopuler">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Papan Peringkat</p>
          <h2 className="section-title">Siswa Terpopuler</h2>
          <p className="section-sub">
            Peringkat dihitung dari total like kartu + jumlah komentar yang diterima. Update realtime!
          </p>
        </div>
        {ranking.length === 0 ? (
          <p className="popular-empty">Belum ada like atau komentar — jadilah yang pertama bikin papan ini rame!</p>
        ) : (
          <div className="popular-list">
            {ranking.map((r, i) => {
              const src = r.siswa.photo || getPlaceholderDataUrl(r.siswa.nama);
              return (
                <div className={'popular-item' + (i < 3 ? ' top3' : '')} key={r.sid}>
                  <div className="popular-rank">{MEDALI[i] || `#${i + 1}`}</div>
                  <div className="popular-avatar"><img src={src} alt={r.siswa.nama} /></div>
                  <div className="popular-info">
                    <div className="popular-name">{r.siswa.nama}</div>
                    <div className="popular-stats">
                      <span><Heart size={11} fill="currentColor" /> {r.like}</span>
                      <span><MessageCircle size={11} /> {r.komen}</span>
                    </div>
                  </div>
                  <div className="popular-score">
                    <Trophy size={12} /> {r.skor}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
