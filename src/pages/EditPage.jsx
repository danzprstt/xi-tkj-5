import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, Upload, Music2, Trash2 } from 'lucide-react';
import { SISWA } from '../data/siswa.js';
import { lagu as LAGU_DEFAULT } from '../data/lagu.js';
import { getSiswaId, getPlaceholderDataUrl } from '../utils/helpers.js';
import { fileToBase64, getFileExt } from '../utils/fileToBase64.js';
import '../styles/global.css';
import '../styles/edit-page.css';

async function api(path, options) {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => ({ ok: false, error: 'Respons server tidak valid.' }));
  return { status: res.status, ...data };
}

function KeyGate({ siswa, onUnlocked }) {
  const [kode, setKode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!kode.trim()) return;
    setBusy(true);
    setErr('');
    const sid = getSiswaId(siswa);
    const res = await api('/api/verify-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid, key: kode.trim() }),
    });
    setBusy(false);
    if (res.ok) onUnlocked(res.token);
    else setErr(res.error || 'Gagal verifikasi.');
  };

  return (
    <div className="editpage-gate">
      <Lock size={22} />
      <p>Masukkan kode edit milik <b>{siswa.nama}</b></p>
      <input
        type="text"
        placeholder="Kode 6 karakter"
        maxLength={6}
        value={kode}
        onChange={(e) => setKode(e.target.value.toUpperCase())}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        autoFocus
      />
      <button disabled={busy} onClick={submit}>{busy ? 'Memeriksa...' : 'Verifikasi'}</button>
      {err && <div className="editpage-error">{err}</div>}
    </div>
  );
}

function EditForm({ siswa, token, onSelesai }) {
  const sid = getSiswaId(siswa);
  const laguAwal = LAGU_DEFAULT[siswa.no] || {};

  const [judul, setJudul] = useState(laguAwal.judul || '');
  const [pencipta, setPencipta] = useState(laguAwal.pencipta || '');
  const [keterangan, setKeterangan] = useState(laguAwal.keterangan || '');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(siswa.photo || getPlaceholderDataUrl(siswa.nama));
  const [laguFile, setLaguFile] = useState(null);

  const [gelembung, setGelembung] = useState('');
  const [gelembungAda, setGelembungAda] = useState(false);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api('/api/gelembung').then((res) => {
      if (res.ok && res.data && res.data[sid]) {
        setGelembung(res.data[sid]);
        setGelembungAda(true);
      }
    });
  }, [sid]);

  const pilihFoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFotoFile(f);
    setFotoPreview(URL.createObjectURL(f));
  };

  const simpanProfil = async () => {
    setBusy(true);
    setStatus('Menyimpan & commit ke GitHub...');
    try {
      const body = { token, sid, no: siswa.no, judul, pencipta, keterangan };
      if (fotoFile) {
        body.fotoBase64 = await fileToBase64(fotoFile);
        body.fotoExt = getFileExt(fotoFile.name) || 'jpg';
      }
      if (laguFile) {
        body.laguBase64 = await fileToBase64(laguFile);
        body.laguExt = getFileExt(laguFile.name) || 'mp3';
      }
      const res = await api('/api/edit-profil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setStatus(res.ok
        ? '✓ Tersimpan! ' + (res.note || '')
        : '⚠ ' + (res.error || 'Gagal menyimpan.'));
    } catch (e) {
      setStatus('⚠ ' + e.message);
    }
    setBusy(false);
  };

  const simpanGelembung = async () => {
    if (!gelembung.trim()) return;
    setBusy(true);
    const res = await api('/api/gelembung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, sid, teks: gelembung }),
    });
    setBusy(false);
    setStatus(res.ok ? '✓ Gelembung mimpi tersimpan.' : '⚠ ' + (res.error || 'Gagal.'));
    if (res.ok) setGelembungAda(true);
  };

  const hapusGelembung = async () => {
    if (!confirm('Hapus gelembung mimpi ini?')) return;
    setBusy(true);
    const res = await api('/api/gelembung', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, sid }),
    });
    setBusy(false);
    if (res.ok) { setGelembung(''); setGelembungAda(false); setStatus('✓ Gelembung mimpi dihapus.'); }
  };

  return (
    <div className="editpage-form">
      <button className="editpage-back" onClick={onSelesai}><ArrowLeft size={14} /> Kembali ke daftar</button>
      <h2>Edit Profil — {siswa.nama}</h2>

      <div className="editpage-field">
        <label>Foto profil</label>
        <div className="editpage-foto-row">
          <img src={fotoPreview} alt="" className="editpage-foto-preview" />
          <label className="editpage-upload-btn">
            <Upload size={14} /> Pilih foto baru
            <input type="file" accept="image/*" onChange={pilihFoto} hidden />
          </label>
        </div>
      </div>

      <div className="editpage-field">
        <label>File lagu (mp3)</label>
        <label className="editpage-upload-btn">
          <Music2 size={14} /> {laguFile ? laguFile.name : 'Pilih file lagu baru (opsional)'}
          <input type="file" accept="audio/*" onChange={(e) => setLaguFile(e.target.files[0] || null)} hidden />
        </label>
      </div>

      <div className="editpage-field">
        <label>Judul lagu</label>
        <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} maxLength={80} />
      </div>
      <div className="editpage-field">
        <label>Pencipta lagu</label>
        <input type="text" value={pencipta} onChange={(e) => setPencipta(e.target.value)} maxLength={60} />
      </div>
      <div className="editpage-field">
        <label>Catatan / keterangan lagu</label>
        <textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} maxLength={200} rows={3} />
      </div>

      <button className="editpage-save-btn" disabled={busy} onClick={simpanProfil}>
        {busy ? 'Memproses...' : 'Simpan Profil (foto + lagu)'}
      </button>

      <div className="editpage-divider" />

      <div className="editpage-field">
        <label>Gelembung mimpi (teks singkat di atas kartu kamu)</label>
        <input
          type="text" value={gelembung} onChange={(e) => setGelembung(e.target.value)}
          maxLength={120} placeholder="Contoh: Semoga sukses PKL nanti!"
        />
        <div className="editpage-gelembung-actions">
          <button disabled={busy} onClick={simpanGelembung}>{gelembungAda ? 'Update' : 'Tambah'}</button>
          {gelembungAda && (
            <button disabled={busy} className="editpage-danger" onClick={hapusGelembung}>
              <Trash2 size={13} /> Hapus
            </button>
          )}
        </div>
      </div>

      {status && <div className="editpage-status">{status}</div>}
    </div>
  );
}

export default function EditPage() {
  const [selected, setSelected] = useState(null); // siswa object
  const [token, setToken] = useState(null);

  const pilih = (s) => { setSelected(s); setToken(null); };
  const batal = () => { setSelected(null); setToken(null); };

  return (
    <div className="editpage-wrap">
      <div className="editpage-header">
        <Link to="/" className="editpage-back-home"><ArrowLeft size={14} /> Ke halaman utama</Link>
        <h1>Edit Profil Siswa</h1>
        <p>Pilih namamu, masukkan kode edit yang kamu punya, lalu update foto, lagu, atau gelembung mimpimu.</p>
      </div>

      {!selected && (
        <div className="editpage-grid">
          {SISWA.map((s) => {
            const src = s.photo || getPlaceholderDataUrl(s.nama);
            return (
              <button className="editpage-card" key={s.no} onClick={() => pilih(s)}>
                <img src={src} alt={s.nama} />
                <span>No. {s.no}</span>
                <b>{s.nama}</b>
              </button>
            );
          })}
        </div>
      )}

      {selected && !token && <KeyGate siswa={selected} onUnlocked={setToken} />}
      {selected && token && <EditForm siswa={selected} token={token} onSelesai={batal} />}
    </div>
  );
}
