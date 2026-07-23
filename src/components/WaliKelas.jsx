export default function WaliKelas() {
  return (
    <section className="section" id="wali">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Pembimbing</p>
          <h2 className="section-title">Wali Kelas</h2>
          <p className="section-sub">
            Sosok yang selalu ada, membimbing dengan sabar di setiap langkah perjalanan XI TKJ 5.
          </p>
        </div>
        <div className="wali-card reveal">
          <div className="wali-avatar">
            <img
              src="/paimam.png"
              alt="Foto Wali Kelas"
              className="gambarpmam"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="wali-info">
            <p className="wali-role">Wali Kelas XI TKJ 5</p>
            <h3 className="wali-name">Lia Septiani, M. Pd, Gr.</h3>
            <p className="wali-desc">
              Sebagai wali kelas yang kami anggap seperti orang tua ke dua setelah ayah dan ibu kami yang sangat
              hebat dalam mendidik kami dengan kesabaran penuh, selain itu juga beliau satu satunya guru yang
              memiliki metode pembelajaran yang sangat unik dan lumayan dmudah di pahamin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
