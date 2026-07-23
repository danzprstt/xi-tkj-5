import { PIKET } from '../data/piket.js';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function Piket() {
  const today = DAY_NAMES[new Date().getDay()];

  return (
    <section className="section" id="piket">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Jadwal</p>
          <h2 className="section-title">Jadwal Piket</h2>
          <p className="section-sub">Siapa yang piket hari ini? Jangan sampai kelas kotor ya!</p>
        </div>
        <div className="piket-grid">
          {PIKET.map((p) => {
            const isToday = p.day === today;
            return (
              <div
                className="piket-card"
                key={p.day}
                style={isToday ? { borderColor: 'rgba(245,200,66,.45)' } : undefined}
              >
                <div className={'piket-day' + (isToday ? ' today' : '')}>
                  {p.day}{isToday ? ' ← hari ini' : ''}
                </div>
                <div className="piket-names">
                  {p.names.map((n, i) => (
                    <span key={n}>{n}{i < p.names.length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
