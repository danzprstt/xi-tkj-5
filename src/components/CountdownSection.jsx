import useCountdown, { COUNTDOWN_LABEL } from '../hooks/useCountdown.js';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CountdownSection() {
  const { hari, jam, menit, detik } = useCountdown();

  return (
    <section className="section" id="countdown">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Timer</p>
          <h2 className="section-title">Hitung Mundur</h2>
          <p className="section-sub">Seberapa siap kamu menghadapi hari besar ini?</p>
          <p className="cd-event">{COUNTDOWN_LABEL}</p>
        </div>
        <div className="countdown-wrap">
          <div className="cd-item"><div className="cd-num">{pad(hari)}</div><div className="cd-lbl">Hari</div></div>
          <div className="cd-item"><div className="cd-num">{pad(jam)}</div><div className="cd-lbl">Jam</div></div>
          <div className="cd-item"><div className="cd-num">{pad(menit)}</div><div className="cd-lbl">Menit</div></div>
          <div className="cd-item"><div className="cd-num">{pad(detik)}</div><div className="cd-lbl">Detik</div></div>
        </div>
      </div>
    </section>
  );
}
