import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Menu, Check, Info, UserCog, ShieldCheck } from 'lucide-react';
import useTheme, { THEMES } from '../hooks/useTheme.js';
import DetailKelasModal from './DetailKelasModal.jsx';

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="menu-wrap">
      <button className="theme-btn" onClick={() => setOpen((o) => !o)} title="Ganti tema">
        <Palette size={15} />
      </button>
      <div className={'theme-dropdown' + (open ? ' open' : '')}>
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={'theme-option' + (theme === t.id ? ' active' : '')}
            onClick={() => { setTheme(t.id); setOpen(false); }}
          >
            <span className="theme-swatch" style={{ background: t.swatchBg, borderColor: t.swatchAccent }}>
              <span className="theme-swatch-dot" style={{ background: t.swatchAccent }} />
            </span>
            <span className="theme-option-label">{t.label}</span>
            {theme === t.id && <Check size={13} className="theme-check" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="topnav">
      <span className="topnav-logo">XI TKJ 5</span>
      <div className="nav-actions">
        <button className="theme-btn" onClick={() => setDetailOpen(true)} title="Info Kelas (Pengumuman, Tugas, Kas)">
          <Info size={15} />
        </button>
        <ThemePicker />
        <div className="menu-wrap">
          <button className="theme-btn" onClick={() => setMenuOpen((o) => !o)} title="Menu">
            <Menu size={15} />
          </button>
          <div className={'nav-dropdown' + (menuOpen ? ' open' : '')} id="navDropdown">
            <a href="#home" onClick={closeMenu}>Beranda</a>
            <a href="#wali" onClick={closeMenu}>Wali Kelas</a>
            <a href="#struktur" onClick={closeMenu}>Struktur</a>
            <a href="#siswa" onClick={closeMenu}>Siswa</a>
            <a href="#terpopuler" onClick={closeMenu}>Terpopuler</a>
            <a href="#foto" onClick={closeMenu}>Kenangan</a>
            <a href="#jadwal-mapel" onClick={closeMenu}>Jadwal Mapel</a>
            <a href="#menfess" onClick={closeMenu}>Menfess</a>
            <a href="#pesan" onClick={closeMenu}>Pesan</a>
            <a href="https://smkkbm1.sch.id" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
              Sekolah ↗
            </a>
            <Link to="/edit-dengan-keamanan-key" onClick={closeMenu}>
              <UserCog size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} /> Edit Profil Siswa
            </Link>

            <div className="nav-dropdown-divider" />
            <div className="nav-dropdown-label">Khusus Pengurus</div>
            <Link to="/private-pr-kelas" onClick={closeMenu} className="nav-dropdown-admin">
              <ShieldCheck size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} /> Dashboard Admin
            </Link>
          </div>
        </div>
      </div>
      <DetailKelasModal open={detailOpen} onClose={() => setDetailOpen(false)} />
    </nav>
  );
}
