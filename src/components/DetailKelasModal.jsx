import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Megaphone, ClipboardList, Wallet } from 'lucide-react';
import usePengumumanPublik from '../hooks/usePengumumanPublik.js';
import useTugasPublik from '../hooks/useTugasPublik.js';
import useKasPublik from '../hooks/useKasPublik.js';

function formatTanggalPendek(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function sisaHari(deadline) {
  const d = new Date(deadline);
  const now = new Date();
  d.setHours(23, 59, 59, 999);
  const diff = Math.ceil((d - now) / 86400000);
  if (diff < 0) return { teks: 'Lewat deadline', warna: '#ff5c7a' };
  if (diff === 0) return { teks: 'Deadline hari ini!', warna: '#ff9f43' };
  return { teks: `${diff} hari lagi`, warna: diff <= 2 ? '#ff9f43' : 'var(--gold)' };
}

export default function DetailKelasModal({ open, onClose }) {
  const [tab, setTab] = useState('pengumuman');
  const { list: pengumuman, loading: loadingP } = usePengumumanPublik();
  const { list: tugas, loading: loadingT } = useTugasPublik();
  const { list: kas, loading: loadingK, saldo, rekapPerSiswa } = useKasPublik();

  if (!open) return null;

  return createPortal(
    <div className="detail-kelas-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="detail-kelas-card">
        <div className="detail-kelas-header">
          <h3>Info Kelas</h3>
          <button className="foto-fullscreen-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="detail-kelas-tabs">
          <button className={tab === 'pengumuman' ? 'active' : ''} onClick={() => setTab('pengumuman')}><Megaphone size={14} /> Pengumuman</button>
          <button className={tab === 'tugas' ? 'active' : ''} onClick={() => setTab('tugas')}><ClipboardList size={14} /> Tugas &amp; PR</button>
          <button className={tab === 'kas' ? 'active' : ''} onClick={() => setTab('kas')}><Wallet size={14} /> Kas Kelas</button>
        </div>

        <div className="detail-kelas-body">
          {tab === 'pengumuman' && (
            loadingP ? <p className="popular-empty">Memuat...</p> : pengumuman.length === 0 ? (
              <p className="popular-empty">Belum ada pengumuman.</p>
            ) : (
              <div className="detail-kelas-list">
                {pengumuman.map((p) => (
                  <div className="detail-kelas-item" key={p.id}>
                    <div className="detail-kelas-item-title">{p.judul}</div>
                    <div className="detail-kelas-item-desc">{p.isi}</div>
                    <div className="detail-kelas-item-sub">{formatTanggalPendek(p.createdAt)}</div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'tugas' && (
            loadingT ? <p className="popular-empty">Memuat...</p> : tugas.length === 0 ? (
              <p className="popular-empty">Belum ada tugas.</p>
            ) : (
              <div className="detail-kelas-list">
                {tugas.map((t) => {
                  const sisa = sisaHari(t.deadline);
                  return (
                    <div className="detail-kelas-item" key={t.id}>
                      <div className="detail-kelas-item-title">
                        {t.mapel} <span style={{ color: sisa.warna, fontSize: '.68rem', fontFamily: "'DM Mono',monospace" }}>· {sisa.teks}</span>
                      </div>
                      {t.guru && <div className="detail-kelas-item-sub">Guru: {t.guru}</div>}
                      {t.deskripsi && <div className="detail-kelas-item-desc">{t.deskripsi}</div>}
                      <div className="detail-kelas-item-sub">Deadline: {formatTanggalPendek(t.deadline)}</div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === 'kas' && (
            loadingK ? <p className="popular-empty">Memuat...</p> : (
              <>
                <div className="detail-kelas-saldo">
                  Saldo kas kelas saat ini: <b>Rp{saldo.toLocaleString('id-ID')}</b>
                </div>
                {Object.keys(rekapPerSiswa).length > 0 && (
                  <>
                    <div className="detail-kelas-subheading">Rekap per Siswa</div>
                    <div className="detail-kelas-list" style={{ marginBottom: 16 }}>
                      {Object.entries(rekapPerSiswa).map(([sid, r]) => (
                        <div className="detail-kelas-item" key={sid}>
                          <div className="detail-kelas-item-title">{r.siswaNama}</div>
                          <div className="detail-kelas-item-sub">
                            Setor: Rp{r.masuk.toLocaleString('id-ID')} · Ambil: Rp{r.keluar.toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="detail-kelas-subheading">Riwayat Transaksi</div>
                {kas.length === 0 ? <p className="popular-empty">Belum ada catatan kas.</p> : (
                  <div className="detail-kelas-list">
                    {kas.map((t) => (
                      <div className="detail-kelas-item" key={t.id}>
                        <div className="detail-kelas-item-title">
                          {t.keterangan}{' '}
                          <span className={'private-admin-kas-badge ' + t.tipe}>
                            {t.tipe === 'masuk' ? '+' : '-'}Rp{Number(t.jumlah).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="detail-kelas-item-sub">{t.tanggal}{t.siswaNama ? ` · ${t.siswaNama}` : ' · Umum'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
