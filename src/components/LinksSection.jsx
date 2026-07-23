import { LINKS } from '../data/links.js';

export default function LinksSection() {
  return (
    <section className="section" id="links">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Resources</p>
          <h2 className="section-title">Link Penting</h2>
          <p className="section-sub">Semua link yang sering dibutuhkan XI TKJ 5 ada di sini.</p>
        </div>
        <div className="links-grid">
          {LINKS.map((l) => (
            <a className="link-card" href={l.href} target="_blank" rel="noopener noreferrer" key={l.title}>
              <div className="link-ico" dangerouslySetInnerHTML={{ __html: l.icon }} />
              <div className="link-info">
                <div className="link-title">{l.title}</div>
                <div className="link-url">{l.url}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
