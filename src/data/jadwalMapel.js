// Jadwal mapel per hari disesuaikan dengan perubahan (Senin & Kamis libur, Produktif mengikuti jam reguler)
export const JADWAL_MAPEL = [
  {
    day: 'Senin',
    mapel: [
      { jam: '-', nama: 'libur', guru: '-' },
    ],
  },
  {
    day: 'Selasa',
    mapel: [
      { jam: '07:00 - 07:35', nama: 'Sejarah', guru: 'Astri Febry Susantim S.Pd, Gr.' },
      { jam: '07:35 - 08:10', nama: 'Sejarah', guru: 'Astri Febry Susantim S.Pd, Gr.' },
      { jam: '08:10 - 08:45', nama: 'Pend. Pancasila', guru: 'Yono, S.Sos, Gr.' },
      { jam: '08:45 - 09:20', nama: 'Pend. Pancasila', guru: 'Yono, S.Sos, Gr.' },
      { jam: '09:40 - 10:15', nama: 'Bahasa Inggris', guru: 'Ilham Gumelar Azis, S.Pd, Gr.' },
      { jam: '10:15 - 10:50', nama: 'Bahasa Inggris', guru: 'Ilham Gumelar Azis, S.Pd, Gr.' },
      { jam: '10:50 - 11:25', nama: 'Bahasa Jepang', guru: 'Risa Eliansah, S.Pd, Gr.' },
      { jam: '11:25 - 12:00', nama: 'Bahasa Jepang', guru: 'Risa Eliansah, S.Pd, Gr.' },
      { jam: '13:35 - 14:10', nama: 'PAI', guru: 'Nur Anwar Sadat, S.Pd.I, Gr.' },
      { jam: '14:10 - 14:45', nama: 'PAI', guru: 'Nur Anwar Sadat, S.Pd.I, Gr.' },
    ],
  },
  {
    day: 'Rabu',
    mapel: [
      { jam: '07:00 - 07:35', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '07:35 - 08:10', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '08:10 - 08:45', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '08:45 - 09:20', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '09:40 - 10:15', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '10:15 - 10:50', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '10:50 - 11:25', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '11:25 - 12:00', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '13:35 - 14:10', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
      { jam: '14:10 - 14:45', nama: 'PRODUKTIF', guru: 'Imam Anugrah, S.Kom, Gr.' },
    ],
  },
  {
    day: 'Kamis',
    mapel: [
      { jam: '-', nama: 'libur', guru: '-' },
    ],
  },
  {
    day: 'Jumat',
    mapel: [
      { jam: '07:00 - 07:35', nama: 'Penjasorkes', guru: 'Bima Budiman, S.Pd, Gr.' },
      { jam: '07:35 - 08:10', nama: 'Penjasorkes', guru: 'Bima Budiman, S.Pd, Gr.' },
      { jam: '08:10 - 08:45', nama: 'Matematika', guru: 'Lia Septiani, M.Pd, Gr.' },
      { jam: '08:45 - 09:20', nama: 'Matematika', guru: 'Lia Septiani, M.Pd, Gr.' },
      { jam: '09:40 - 10:15', nama: 'Matematika', guru: 'Lia Septiani, M.Pd, Gr.' },
      { jam: '10:15 - 10:50', nama: 'Kewirausahaan', guru: 'Nurul Fitriani, S.E, Gr.' },
      { jam: '10:50 - 11:25', nama: 'Kewirausahaan', guru: 'Nurul Fitriani, S.E, Gr.' },
      { jam: '11:25 - 13:35', nama: "Sholat Jum'at", guru: '-' },
      { jam: '13:35 - 14:10', nama: 'Bahasa Indonesia', guru: 'Rival Faozan, S.Pd, Gr.' },
      { jam: '14:10 - 14:45', nama: 'Bahasa Indonesia', guru: 'Rival Faozan, S.Pd, Gr.' },
    ],
  },
  {
    day: 'Sabtu',
    mapel: [
      { jam: '07:00 - 07:35', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '07:35 - 08:10', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '08:10 - 08:45', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '08:45 - 09:20', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '09:40 - 10:15', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '10:15 - 10:50', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '10:50 - 11:25', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '11:25 - 12:00', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '13:35 - 14:10', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
      { jam: '14:10 - 14:45', nama: 'PRODUKTIF', guru: 'Annisa Destyani, S.Kom, Gr.' },
    ],
  },
];
