import { useCallback, useEffect, useState } from 'react';

export const THEMES = [
  { id: 'gold-malam', label: 'Gold Malam', isLight: false, swatchBg: '#080810', swatchAccent: '#f5c842' },
  { id: 'cream-siang', label: 'Cream Siang', isLight: true, swatchBg: '#f5f3ee', swatchAccent: '#c8932a' },
  { id: 'ocean-malam', label: 'Ocean Malam', isLight: false, swatchBg: '#060c14', swatchAccent: '#3ee0d8' },
  { id: 'rose-senja', label: 'Rose Senja', isLight: false, swatchBg: '#140810', swatchAccent: '#f2a0c4' },
];

const STORAGE_KEY = 'site_theme';

function applyToDom(id) {
  const meta = THEMES.find((t) => t.id === id) || THEMES[0];
  document.documentElement.setAttribute('data-theme', meta.id);
  document.documentElement.classList.toggle('light', meta.isLight);
  return meta;
}

export default function useTheme() {
  const [theme, setThemeState] = useState('gold-malam');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'gold-malam';
    const meta = applyToDom(saved);
    setThemeState(meta.id);
  }, []);

  const setTheme = useCallback((id) => {
    const meta = applyToDom(id);
    try { localStorage.setItem(STORAGE_KEY, meta.id); } catch { /* ignore */ }
    setThemeState(meta.id);
  }, []);

  return { theme, setTheme, themes: THEMES };
}
