import { KATA_KASAR } from '../data/kataKasar.js';

export function normalisasiTeks(str) {
  let s = String(str).toLowerCase();
  s = s.replace(/4/g, 'a').replace(/@/g, 'a').replace(/3/g, 'e')
       .replace(/1|!/g, 'i').replace(/0/g, 'o').replace(/5|\$/g, 's').replace(/7/g, 't');
  s = s.replace(/[^a-z\s]/g, ' ');
  s = s.replace(/(.)\1{2,}/g, '$1$1'); // "goblokkkk" -> "goblokk"
  return s;
}

export function mengandungKataKasar(teks) {
  const norm = normalisasiTeks(teks);
  return KATA_KASAR.some((kata) =>
    new RegExp('\\b' + kata + '(nya|lah|kah|ku|mu|nih|deh)?\\b', 'i').test(norm)
  );
}
