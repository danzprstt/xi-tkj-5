import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, ArrowLeft, ClipboardList, Wallet, ShieldCheck, Megaphone,
  Plus, Trash2, Pencil, LogOut, Heart,
} from 'lucide-react';
import useKomentar from '../hooks/useKomentar.js';
import { SISWA } from '../data/siswa.js';
import '../styles/global.css';
import '../styles/edit-page.css';
import '../styles/private-admin.css';

const ROLES = [
  { id: 'ketua', label: 'Ketua Kelas' },
  { id: 'wakil', label: 'Wakil Ketua' },
  { id: 'sekretaris', label: 'Sekretaris' },
  { id: 'bendahara', label: 'Bendahara' },
];

async function api(path, options) {
  const res = await fetch(path, options);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return {
      ok: false,
      error: 'Server tidak menjalankan fungsi /api/ ini. Kalau kamu tes pakai `npm run dev`, '
        + 'pakai `vercel dev` sebagai gantinya, atau coba dari situs yang sudah di-deploy.',
    };
  }
  return res.json().catch(() => ({ ok: false, error: 'Respons server tidak bisa dibaca.' }));
}

function LoginGate({ onUnlocked }) {
  const [role, setRole] = useState(null);
  const [kode, setKode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!kode.trim() || !role) return;
    setBusy(true);
    setErr('');
    const res = await api('/api/verify-officer-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, key: kode.trim() }),
    });
    setBusy(false);
    if (res.ok) onUnlocked({ token: res.token, role: res.role, nama: res.nama });
    else setErr(res.error || 'Gagal verifikasi.');
  };

  return (
    <div className="editpage-gate private-admin-gate">
      <Lock size={22} />
      <p>Masuk sebagai pengurus kelas</p>
      <div className="private-admin-role-grid">
        {ROLES.map((r) => (
          <button
            key={r.id}
            className={'private-admin-role-btn' + (role === r.id ? ' active' : '')}
            onClick={() => { setRole(r.id); setErr(''); }}
          >
            {r.label}
          </button>
        ))}
      </div>
      {role && (
        <>
          <input
            type="text"
            placeholder="Kode akses"
            value={kode}
            onChange={(e) => setKode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            autoFocus
          />
          <button disabled={busy} onClick={submit}>{busy ? 'Memeriksa...' : 'Masuk'}</button>
        </>
      )}
      {err && <div className="editpage-error">{err}</div>}
    </div>
  );
}

function TugasTab({ session }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, mapel: '', deskripsi: '', deadline: '', guru: '' });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const muat = async () => {
    setLoading(true);
    const res = await api(`/api/tugas?token=${encodeURIComponent(session.token)}&role=${session.role}`);
    setLoading(false);
    if (res.ok) setList(res.data);
  };

  useEffect(() => { muat(); }, []);

  const simpan = async () => {
    if (!form.mapel.trim() || !form.deadline) { setStatus('⚠ Mapel dan deadline wajib diisi.'); return; }
    setBusy(true);
    const res = await api('/api/tugas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, token: session.token, role: session.role }),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ id: null, mapel: '', deskripsi: '', deadline: '', guru: '' });
      setStatus('✓ Tersimpan.');
      muat();
    } else setStatus('⚠ ' + (res.error || 'Gagal.'));
  };

  const hapus = async (id) => {
    if (!confirm('Hapus tugas ini?')) return;
    await api('/api/tugas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token: session.token, role: session.role }),
    });
    muat();
  };

  return (
    <div className="private-admin-panel">
      <h3><ClipboardList size={16} /> Tugas &amp; Deadline</h3>

      <div className="private-admin-form">
        <input type="text" placeholder="Mapel" value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} />
        <input type="text" placeholder="Guru (opsional)" value={form.guru} onChange={(e) => setForm({ ...form, guru: e.target.value })} />
        <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <textarea placeholder="Deskripsi tugas..." rows={2} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
        <button disabled={busy} onClick={simpan}><Plus size={14} /> {form.id ? 'Update Tugas' : 'Tambah Tugas'}</button>
        {status && <div className="private-admin-status">{status}</div>}
      </div>

      {loading ? <p className="popular-empty">Memuat...</p> : list.length === 0 ? (
        <p className="popular-empty">Belum ada tugas.</p>
      ) : (
        <div className="private-admin-list">
          {list.map((t) => (
            <div className="private-admin-item" key={t.id}>
              <div>
                <div className="private-admin-item-title">{t.mapel} <span className="private-admin-deadline">· {t.deadline}</span></div>
                {t.guru && <div className="private-admin-item-sub">Guru: {t.guru}</div>}
                {t.deskripsi && <div className="private-admin-item-desc">{t.deskripsi}</div>}
              </div>
              <div className="private-admin-item-actions">
                <button onClick={() => setForm({ id: t.id, mapel: t.mapel, deskripsi: t.deskripsi, deadline: t.deadline, guru: t.guru || '' })}><Pencil size={13} /></button>
                <button onClick={() => hapus(t.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KasTab({ session }) {
  const [list, setList] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, tanggal: '', keterangan: '', tipe: 'masuk', jumlah: '', siswaId: '', siswaNama: '' });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const muat = async () => {
    setLoading(true);
    const res = await api(`/api/kas?token=${encodeURIComponent(session.token)}&role=${session.role}`);
    setLoading(false);
    if (res.ok) { setList(res.data); setSaldo(res.saldo); }
  };

  useEffect(() => { muat(); }, []);

  const simpan = async () => {
    if (!form.tanggal || !form.keterangan.trim() || !form.jumlah) { setStatus('⚠ Semua kolom wajib diisi.'); return; }
    setBusy(true);
    const res = await api('/api/kas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, token: session.token, role: session.role }),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ id: null, tanggal: '', keterangan: '', tipe: 'masuk', jumlah: '', siswaId: '', siswaNama: '' });
      setStatus('✓ Tersimpan.');
      muat();
    } else setStatus('⚠ ' + (res.error || 'Gagal.'));
  };

  const hapus = async (id) => {
    if (!confirm('Hapus catatan kas ini?')) return;
    await api('/api/kas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token: session.token, role: session.role }),
    });
    muat();
  };

  return (
    <div className="private-admin-panel">
      <h3><Wallet size={16} /> Dokumentasi Uang Kas</h3>
      <div className="private-admin-saldo">
        Saldo saat ini: <b>Rp{saldo.toLocaleString('id-ID')}</b>
      </div>

      <div className="private-admin-form">
        <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
        <input type="text" placeholder="Keterangan" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
        <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
          <option value="masuk">Uang Masuk</option>
          <option value="keluar">Uang Keluar</option>
        </select>
        <input type="number" placeholder="Jumlah (Rp)" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} />
        <select
          value={form.siswaId}
          onChange={(e) => {
            const s = SISWA.find((x) => String(x.no) === e.target.value);
            setForm({ ...form, siswaId: e.target.value, siswaNama: s ? s.nama : '' });
          }}
        >
          <option value="">— Umum (kas kelas, bukan per siswa) —</option>
          {SISWA.map((s) => <option key={s.no} value={s.no}>{s.nama}</option>)}
        </select>
        <button disabled={busy} onClick={simpan}><Plus size={14} /> {form.id ? 'Update Catatan' : 'Tambah Catatan'}</button>
        {status && <div className="private-admin-status">{status}</div>}
      </div>

      {loading ? <p className="popular-empty">Memuat...</p> : list.length === 0 ? (
        <p className="popular-empty">Belum ada catatan kas.</p>
      ) : (
        <div className="private-admin-list">
          {list.map((t) => (
            <div className="private-admin-item" key={t.id}>
              <div>
                <div className="private-admin-item-title">
                  {t.keterangan}{' '}
                  <span className={'private-admin-kas-badge ' + t.tipe}>
                    {t.tipe === 'masuk' ? '+' : '-'}Rp{Number(t.jumlah).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="private-admin-item-sub">{t.tanggal}{t.siswaNama ? ` · ${t.siswaNama}` : ' · Umum'}</div>
              </div>
              <div className="private-admin-item-actions">
                <button onClick={() => setForm({ id: t.id, tanggal: t.tanggal, keterangan: t.keterangan, tipe: t.tipe, jumlah: t.jumlah, siswaId: t.siswaId || '', siswaNama: t.siswaNama || '' })}><Pencil size={13} /></button>
                <button onClick={() => hapus(t.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PengumumanTab({ session }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, judul: '', isi: '' });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const muat = async () => {
    setLoading(true);
    const res = await api('/api/pengumuman');
    setLoading(false);
    if (res.ok) setList(res.data);
  };

  useEffect(() => { muat(); }, []);

  const simpan = async () => {
    if (!form.judul.trim() || !form.isi.trim()) { setStatus('⚠ Judul dan isi wajib diisi.'); return; }
    setBusy(true);
    const res = await api('/api/pengumuman', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, token: session.token, role: session.role }),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ id: null, judul: '', isi: '' });
      setStatus('✓ Tersimpan.');
      muat();
    } else setStatus('⚠ ' + (res.error || 'Gagal.'));
  };

  const hapus = async (id) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    await api('/api/pengumuman', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token: session.token, role: session.role }),
    });
    muat();
  };

  return (
    <div className="private-admin-panel">
      <h3><Megaphone size={16} /> Pengumuman</h3>
      <p className="private-admin-hint">Tampil ke semua siswa di halaman utama (tombol di sebelah tema).</p>

      <div className="private-admin-form">
        <input type="text" placeholder="Judul pengumuman" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
        <textarea placeholder="Isi pengumuman..." rows={3} value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} />
        <button disabled={busy} onClick={simpan}><Plus size={14} /> {form.id ? 'Update Pengumuman' : 'Tambah Pengumuman'}</button>
        {status && <div className="private-admin-status">{status}</div>}
      </div>

      {loading ? <p className="popular-empty">Memuat...</p> : list.length === 0 ? (
        <p className="popular-empty">Belum ada pengumuman.</p>
      ) : (
        <div className="private-admin-list">
          {list.map((p) => (
            <div className="private-admin-item" key={p.id}>
              <div>
                <div className="private-admin-item-title">{p.judul}</div>
                <div className="private-admin-item-desc">{p.isi}</div>
              </div>
              <div className="private-admin-item-actions">
                <button onClick={() => setForm({ id: p.id, judul: p.judul, isi: p.isi })}><Pencil size={13} /></button>
                <button onClick={() => hapus(p.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModerasiTab() {
  const { komentarMap, hapusKomentar } = useKomentar();
  const komentarList = Object.values(komentarMap).sort((a, b) => b.createdAtMs - a.createdAtMs).slice(0, 30);

  return (
    <div className="private-admin-panel">
      <h3><ShieldCheck size={16} /> Moderasi Komentar</h3>
      <p className="private-admin-hint">30 komentar terbaru dari seluruh siswa. Hapus kalau ada yang tidak pantas (lolos filter otomatis).</p>
      {komentarList.length === 0 ? (
        <p className="popular-empty">Belum ada komentar.</p>
      ) : (
        <div className="private-admin-list">
          {komentarList.map((k) => (
            <div className="private-admin-item" key={k.id}>
              <div>
                <div className="private-admin-item-title">{k.nama}</div>
                <div className="private-admin-item-desc">{k.teks}</div>
                <div className="private-admin-item-sub">
                  <Heart size={11} /> {k.likes || 0} · siswa {k.siswaId}
                </div>
              </div>
              <div className="private-admin-item-actions">
                <button onClick={() => hapusKomentar(k.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrivateAdminPage() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('pengumuman');

  return (
    <div className="editpage-wrap">
      <div className="editpage-header">
        <Link to="/" className="editpage-back-home"><ArrowLeft size={14} /> Ke halaman utama</Link>
        <h1>Dashboard Pengurus Kelas</h1>
        <p>Halaman privat — kelola tugas/PR, dokumentasi kas, dan moderasi komentar. Tidak muncul di halaman publik.</p>
      </div>

      {!session ? (
        <LoginGate onUnlocked={setSession} />
      ) : (
        <>
          <div className="private-admin-topbar">
            <span>Masuk sebagai <b>{session.nama}</b></span>
            <button className="private-admin-logout" onClick={() => setSession(null)}><LogOut size={13} /> Keluar</button>
          </div>
          <div className="private-admin-tabs">
            <button className={tab === 'pengumuman' ? 'active' : ''} onClick={() => setTab('pengumuman')}><Megaphone size={14} /> Pengumuman</button>
            <button className={tab === 'tugas' ? 'active' : ''} onClick={() => setTab('tugas')}><ClipboardList size={14} /> Tugas &amp; PR</button>
            <button className={tab === 'kas' ? 'active' : ''} onClick={() => setTab('kas')}><Wallet size={14} /> Kas Kelas</button>
            <button className={tab === 'moderasi' ? 'active' : ''} onClick={() => setTab('moderasi')}><ShieldCheck size={14} /> Moderasi</button>
          </div>
          {tab === 'pengumuman' && <PengumumanTab session={session} />}
          {tab === 'tugas' && <TugasTab session={session} />}
          {tab === 'kas' && <KasTab session={session} />}
          {tab === 'moderasi' && <ModerasiTab />}
        </>
      )}
    </div>
  );
}
