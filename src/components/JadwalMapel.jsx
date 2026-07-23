import { JADWAL_MAPEL } from '../data/jadwalMapel.js';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function JadwalMapel() {
  const today = DAY_NAMES[new Date().getDay()];

  return (
    <section className="section" id="jadwal-mapel">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Akademik</p>
          <h2 className="section-title">Jadwal Mapel</h2>
          <p className="section-sub">Jam pelajaran dan pengajar untuk tiap harinya — biar gak salah masuk kelas.</p>
        </div>
        <div className="jadwal-grid">
          {JADWAL_MAPEL.map((hari) => {
            const isToday = hari.day === today;
            return (
              <div className={'jadwal-card' + (isToday ? ' today' : '')} key={hari.day}>
                <div className="jadwal-day">{hari.day}{isToday ? ' ← hari ini' : ''}</div>
                {hari.mapel.map((m, i) => (
                  <div className="jadwal-item" key={i}>
                    <div className="jadwal-jam">{m.jam}</div>
                    <div className="jadwal-info">
                      <div className="jadwal-nama">{m.nama}</div>
                      <div className="jadwal-guru">{m.guru}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
