import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/global.css';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '24px', gap: '14px',
    }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3rem', color: 'var(--gold)' }}>404</div>
      <p style={{ color: 'var(--cream)', fontFamily: "'DM Sans', sans-serif" }}>
        Halaman tidak ditemukan. Coba cek lagi URL-nya, mungkin ada salah ketik.
      </p>
      <Link
        to="/"
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px',
          color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '.8rem', textDecoration: 'none',
        }}
      >
        <ArrowLeft size={14} /> Kembali ke halaman utama
      </Link>
    </div>
  );
}
