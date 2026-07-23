import { useEffect, useMemo, useState } from 'react';
import { formatSisaWaktu } from '../utils/helpers.js';
import useRateLimit from '../hooks/useRateLimit.js';

const LIMIT_PER_HARI = 3;

export default function PesanSection({ pesanMap, kirimPesan, hapusPesan }) {
  const [teks, setTeks] = useState('');
  const [durasi, setDurasi] = useState('604800000');
  const [status, setStatus] = useState('Pesan akan muncul melayang di halaman & di daftar bawah ini');
  const [sending, setSending] = useState(false);
  const [tick, setTick] = useState(0); // dipakai buat maksa teks "Hangus dlm..." ke-render ulang berkala

  const { sisa, bolehKirim, catatKirim } = useRateLimit('pesan_ratelimit', LIMIT_PER_HARI);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(iv);
  }, []);

  const items = useMemo(() => {
    const now = Date.now();
    return Object.entries(pesanMap)
      .filter(([, v]) => v.expiresAtMs > now)
      .sort((a, b) => b[1].createdAtMs - a[1].createdAtMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pesanMap, tick]);

  const handleKirim = async () => {
    if (!teks.trim()) return;
    if (!bolehKirim) {
      setStatus(`⚠ Kamu sudah mengirim ${LIMIT_PER_HARI}x hari ini. Coba lagi besok ya!`);
      return;
    }
    setSending(true);
    setStatus('Mengirim...');
    const res = await kirimPesan(teks, durasi);
    setSending(false);
    if (res.ok) {
      catatKirim();
      setTeks('');
      setStatus('✓ Pesan terkirim!');
      setTimeout(() => setStatus('Pesan akan muncul melayang di halaman & di daftar bawah ini'), 3000);
    } else if (res.error) {
      setStatus(res.error);
    }
  };

  return (
    <section className="section" id="pesan">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Suara Kelas</p>
          <h2 className="section-title">Tinggalkan Pesan</h2>
          <p className="section-sub">Tulis pesanmu — akan muncul melayang di seluruh halaman.</p>
        </div>
        <div className="pesan-form">
          <input
            type="text" id="pesanInput" placeholder="Tulis pesanmu di sini..." maxLength={100}
            value={teks} onChange={(e) => setTeks(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleKirim(); }}
            disabled={!bolehKirim}
          />
          <button className="btn-kirim" disabled={sending || !bolehKirim} onClick={handleKirim}>Kirim ✦</button>
        </div>
        <div className="pesan-duration">
          <span>Hangus setelah:</span>
          <select value={durasi} onChange={(e) => setDurasi(e.target.value)}>
            <option value="3600000">1 Jam</option>
            <option value="86400000">1 Hari</option>
            <option value="259200000">3 Hari</option>
            <option value="604800000">1 Minggu</option>
            <option value="2592000000">1 Bulan (maks)</option>
          </select>
        </div>
        <p className="pesan-hint">
          {status}
          {' · '}
          <span style={{ opacity: 0.7 }}>Sisa jatah hari ini: {sisa}/{LIMIT_PER_HARI}</span>
        </p>
        <div className="pesan-list">
          {items.length === 0 ? (
            <p className="pesan-empty">Belum ada pesan.</p>
          ) : (
            items.map(([id, v]) => (
              <div className="pesan-item" key={id}>
                <div className="pesan-text">{v.pesan}</div>
                <div className="pesan-meta">
                  <span className="pesan-expire">{formatSisaWaktu(v.expiresAtMs - Date.now())}</span>
                  <button className="pesan-del" onClick={() => hapusPesan(id)} title="Hapus pesan">Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
