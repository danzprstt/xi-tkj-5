// Jadwal mapel per hari. Tinggal sesuaikan jam/mapel/guru masing-masing —
// urutan array `mapel` dalam satu hari otomatis ditampilkan berurutan.
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
      { jam: '07:00 - 07:35', nama: 'Sejarah', guru: '-' },
      { jam: '07:35 - 08:10', nama: 'Sejarah', guru: '-' },
      { jam: '08:10 - 08:45', nama: 'Pend. Pancasila', guru: '-' },
      { jam: '08:45 - 09:20', nama: 'Pend. Pancasila', guru: '-' },
      { jam: '09:40 - 10:15', nama: 'Bahasa Inggris'},
      { jam: '10:15 - 10:50', nama: 'Bahasa Inggris'},
      { jam: '10:50 - 11:25', nama: 'Bahasa Jepang'},
      { jam: '11:25 - 12:00', nama: 'Bahasa Jepang'},
      { jam: '13:35 - 14:10', nama: 'PAI'},
      { jam: '14:10 - 14:45', nama: 'PAI'},
    ],
  },
  {
    day: 'Rabu',
    mapel: [
      { jam: '07:00 - 09:00', nama: 'Administrasi Infrastruktur Jaringan', guru: '-' },
      { jam: '09:15 - 11:00', nama: 'Teknologi Layanan Jaringan', guru: '-' },
      { jam: '11:15 - 13:00', nama: 'Matematika', guru: '-' },
      { jam: '13:30 - 15:00', nama: 'Seni Budaya', guru: '-' },
    ],
  },
  {
    day: 'Kamis',
    mapel: [
      { jam: '07:00 - 09:00', nama: 'Praktik Kerja Lapangan (Persiapan)', guru: '-' },
      { jam: '09:15 - 11:00', nama: 'Bahasa Indonesia', guru: '-' },
      { jam: '11:15 - 13:00', nama: 'PJOK', guru: '-' },
      { jam: '13:30 - 15:00', nama: 'Sistem Komputer', guru: '-' },
    ],
  },
  {
    day: 'Jumat',
    mapel: [
      { jam: '07:00 - 08:30', nama: 'Pendidikan Agama', guru: '-' },
      { jam: '08:30 - 10:00', nama: 'Bahasa Inggris', guru: '-' },
      { jam: '10:15 - 11:30', nama: 'Teknologi Jaringan Kabel & Nirkabel', guru: '-' },
    ],
  },
  {
    day: 'Sabtu',
    mapel: [
      { jam: '07:00 - 08:30', nama: 'Ekstrakurikuler', guru: '-' },
      { jam: '08:30 - 10:00', nama: 'Bimbingan Konseling', guru: '-' },
    ],
  },
];
