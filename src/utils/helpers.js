export function slugify(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
}

export function getSiswaId(s) {
  return 's' + (s && s.no != null ? s.no : slugify((s && s.nama) || 'x'));
}

// Placeholder avatar (data URL SVG) dipakai kalau siswa belum punya foto.
export function getPlaceholderDataUrl(nama) {
  const inisial = String(nama || '?').trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <rect width="300" height="300" fill="#1a1a24"/>
    <text x="50%" y="50%" font-family="Syne, sans-serif" font-size="110" font-weight="700"
      fill="#f5c842" text-anchor="middle" dominant-baseline="central">${inisial}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function formatSisaWaktu(ms) {
  if (ms <= 0) return 'Hangus';
  const menit = Math.floor(ms / 60000);
  const jam = Math.floor(menit / 60);
  const hari = Math.floor(jam / 24);
  if (hari >= 1) return `Hangus dlm ${hari}h ${jam % 24}j`;
  if (jam >= 1) return `Hangus dlm ${jam}j ${menit % 60}m`;
  return `Hangus dlm ${Math.max(1, menit)}m`;
}

export function getJabatan(struktur, nama) {
  const r = [];
  struktur.forEach((l) => l.nodes.forEach((n) => { if (n.names.includes(nama)) r.push(n.jabatan); }));
  return r;
}
