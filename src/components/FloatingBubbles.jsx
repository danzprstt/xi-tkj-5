import { useEffect, useRef, useState } from 'react';

function Bubble({ text, onDone }) {
  const elRef = useRef(null);
  const [style, setStyle] = useState(() => {
    const vw = window.innerWidth;
    const topPct = 10 + Math.random() * 70;
    const goRight = Math.random() > 0.5;
    const startX = goRight ? -260 : vw + 10;
    const endX = goRight ? vw + 10 : -260;
    const dur = 12000 + Math.random() * 10000;
    return { topPct, startX, endX, dur, opacity: 0, x: startX, removed: false };
  });

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setStyle((s) => ({ ...s, opacity: 0.92, x: s.endX }));
      });
      return () => cancelAnimationFrame(raf2);
    });
    const fadeTimer = setTimeout(() => {
      setStyle((s) => ({ ...s, opacity: 0 }));
    }, style.dur - 500);
    const doneTimer = setTimeout(onDone, style.dur);
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHapus = () => {
    setStyle((s) => ({ ...s, opacity: 0, scale: 0.85 }));
    setTimeout(onDone, 180);
  };

  return (
    <div
      ref={elRef}
      className="fpill"
      style={{
        top: `${style.topPct}vh`,
        left: `${style.x}px`,
        opacity: style.opacity,
        transition: `left ${style.dur}ms linear, opacity 0.5s linear`,
      }}
    >
      {text}
      <button className="fpill-del" title="Hapus" onClick={handleHapus}>✕</button>
    </div>
  );
}

export default function FloatingBubbles({ bubbles, onRemove }) {
  return (
    <div id="floatOverlay">
      {bubbles.map((b) => (
        <Bubble key={b.key} text={b.text} onDone={() => onRemove(b.key)} />
      ))}
    </div>
  );
}
