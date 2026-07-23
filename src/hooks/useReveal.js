import { useEffect } from 'react';

export default function useReveal(deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.v)'));
    if (!els.length) return undefined;

    // Cek langsung: elemen yang SUDAH kelihatan di viewport saat effect ini jalan
    // (mis. konten di atas fold) langsung ditandai tanpa nunggu callback observer,
    // supaya tidak ada race-condition dengan React StrictMode yang menjalankan
    // effect dua kali di development (observer lama bisa keburu disconnect
    // sebelum callback async-nya sempat jalan).
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const belumTerlihat = [];
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.9 && rect.bottom > 0) {
        el.classList.add('v');
      } else {
        belumTerlihat.push(el);
      }
    });

    if (!belumTerlihat.length) return undefined;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('v');
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.1 }
    );
    belumTerlihat.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
