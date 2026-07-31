import { ExternalLink, Music2 } from 'lucide-react';
import { PLAYLIST_SPOTIFY_URL } from '../data/playlist.js';

function getEmbedUrl(url) {
  // Ubah link playlist Spotify biasa jadi link embed-nya.
  // Contoh input : https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
  // Jadi         : https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean); // ['playlist', '<id>'] atau ['embed','playlist','<id>']
    const idx = parts.indexOf('playlist');
    const id = idx !== -1 ? parts[idx + 1] : null;
    if (!id) return null;
    return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
}

export default function PlaylistKelas() {
  const embedUrl = getEmbedUrl(PLAYLIST_SPOTIFY_URL);

  return (
    <section className="section" id="playlist-kelas">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Soundtrack</p>
          <h2 className="section-title">Playlist Lagu Kelas</h2>
          <p className="section-sub">
            Kumpulan lagu favorit XI TKJ 5 — dengerin langsung di sini atau buka di Spotify.
          </p>
        </div>

        <div className="playlist-card reveal">
          {embedUrl ? (
            <iframe
              title="Playlist Lagu Kelas XI TKJ 5"
              src={embedUrl}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="playlist-iframe"
            />
          ) : (
            <div className="playlist-fallback">
              <Music2 size={28} />
              <p>Link playlist belum valid — cek <code>src/data/playlist.js</code>.</p>
            </div>
          )}

          <a
            href={PLAYLIST_SPOTIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="playlist-open-btn"
          >
            <ExternalLink size={14} /> Buka di Spotify
          </a>
        </div>
      </div>
    </section>
  );
}
