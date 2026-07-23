import { X, Music2, Play, Pause } from 'lucide-react';
import { getPlaceholderDataUrl, getJabatan } from '../utils/helpers.js';
import { STRUKTUR } from '../data/struktur.js';

export default function PhotoModal({ siswa, open, onClose, laguPlayer }) {
  const { audioRef, laguAktif, sedangMain, error, toggle } = laguPlayer;
  const src = siswa ? (siswa.photo || getPlaceholderDataUrl(siswa.nama)) : '';
  const tags = siswa ? getJabatan(STRUKTUR, siswa.nama) : [];

  return (
    <>
      <div
        className={'siswa-lightbox' + (open ? ' open' : '')}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {siswa && (
          <div className="lightbox-flex-wrap">
            {laguAktif && (
              <div className="lagu-info-panel">
                <div className="lagu-info-icon"><Music2 size={16} /></div>
                <div className="lagu-info-label">Sedang diputar</div>
                <div className="lagu-info-judul">{laguAktif.judul || '—'}</div>
                <div className="lagu-info-pencipta">{laguAktif.pencipta ? 'oleh ' + laguAktif.pencipta : ''}</div>
                <div className="lagu-info-keterangan">
                  {laguAktif.keterangan || ''}
                  {error && (
                    <>
                      <br />
                      <span style={{ color: '#ff5c7a' }}>⚠ File lagu gagal dimuat, cek path-nya.</span>
                    </>
                  )}
                </div>
                <button className="lagu-toggle-btn" onClick={toggle}>
                  {sedangMain ? <Pause size={13} /> : <Play size={13} />} {sedangMain ? 'Jeda' : 'Putar'}
                </button>
              </div>
            )}
            <div className="siswa-lightbox-card">
              <button className="siswa-lightbox-close" onClick={onClose} aria-label="Tutup">
                <X size={18} />
              </button>
              <div className="siswa-lightbox-photo">
                <img src={src} alt={siswa.nama || 'Foto siswa'} />
              </div>
              <div className="siswa-lightbox-body">
                <div>
                  <div className="siswa-lightbox-no">No. {siswa.no || ''}</div>
                  <div className="siswa-lightbox-name">{siswa.nama || ''}</div>
                  <div className="siswa-lightbox-tags">
                    {tags.map((t) => <span className="siswa-tag" key={t}>{t}</span>)}
                  </div>
                </div>
                <div className={'siswa-gender ' + (siswa.lp || '')} title={siswa.lp === 'L' ? 'Laki-laki' : 'Perempuan'}>
                  {siswa.lp || ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Elemen audio SENGAJA ditaruh di posisi tetap (di luar konten yang bergantung
          pada `siswa`), supaya audioRef tidak pernah ikut remount saat siswa berubah
          dari null <-> object. Kalau ikut remount, .play() yang dipanggil di
          putarUntukSiswa() akan mengenai elemen <audio> yang lama (yang justru akan
          dibuang React setelahnya), sehingga lagu terasa "tidak pernah autoplay". */}
      <audio ref={audioRef} loop style={{ display: 'none' }} />
    </>
  );
}
