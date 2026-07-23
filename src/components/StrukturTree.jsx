import { useEffect, useState } from 'react';
import { STRUKTUR } from '../data/struktur.js';
import { IC } from '../data/icons.js';
import { ChevronDown } from 'lucide-react';

function TreeNode({ node, isRoot, entered, delayMs }) {
  const [open, setOpen] = useState(false);

  const entranceStyle = {
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.55s ease-out ${delayMs}ms, transform 0.55s ease-out ${delayMs}ms`,
  };

  return (
    <div className={'tree-node' + (isRoot ? ' root' : '')} style={entranceStyle}>
      <div className="node-icon" dangerouslySetInnerHTML={{ __html: IC[node.icon] || IC.users }} />
      <div className="node-jabatan">{node.jabatan}</div>
      <div className="node-names">
        {node.names.map((nm, idx) => (
          <span key={nm} className={idx === 1 ? 'n2' : idx === 2 ? 'n3' : undefined}>
            {nm}
          </span>
        ))}
      </div>
      <p className="node-desc" style={{ display: open ? 'block' : 'none' }}>{node.desc}</p>
      <button className="btn-more" onClick={() => setOpen((o) => !o)}>
        <ChevronDown size={11} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        {' '}{open ? 'Tutup' : 'Detail'}
      </button>
    </div>
  );
}

export default function StrukturTree() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  // Index global lintas level, meniru anime.stagger(70, { start: 200 }) di versi lama —
  // semua tree-node kebagian delay berurutan, bukan per-level/per-kolom.
  let globalIndex = -1;

  return (
    <section className="section" id="struktur">
      <div className="container">
        <div className="reveal">
          <p className="section-label">// Pengurus</p>
          <h2 className="section-title">Struktur Kelas</h2>
          <p className="section-sub">
            Organisasi penggerak XI TKJ 5 — mereka yang bertanggung jawab menjaga semangat dan kebersamaan kelas.
          </p>
        </div>
        <div className="tree-scroll">
          <div className="tree" id="treeRoot">
            {STRUKTUR.map((lvl, li) => (
              <div key={li}>
                {li > 0 && <div className="tree-vc" />}
                <div className="tree-level">
                  {lvl.nodes.map((n) => {
                    globalIndex += 1;
                    const delayMs = 200 + globalIndex * 70;
                    return (
                      <div className="tree-col" key={n.jabatan}>
                        {lvl.nodes.length > 1 && <div className="tree-col-vc" />}
                        <TreeNode node={n} isRoot={li === 0} entered={entered} delayMs={delayMs} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
