import { useState, useEffect } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      setDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    setDark(!isLight);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="topnav">
      <span className="topnav-logo">XI TKJ 5</span>
      <div className="nav-actions">
        <button className="theme-btn" onClick={toggleTheme} title="Ganti tema">
          {dark ? <Moon size={15} /> : <Sun size={15} />}
        </button>
        <div className="menu-wrap">
          <button className="theme-btn" onClick={() => setMenuOpen((o) => !o)} title="Menu">
            <Menu size={15} />
          </button>
          {menuOpen && (
            <div className="nav-dropdown" id="navDropdown">
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
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
