import { useCallback, useEffect, useState } from 'react';
import useReveal from './hooks/useReveal.js';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import WaliKelas from './components/WaliKelas.jsx';
import StrukturTree from './components/StrukturTree.jsx';
import SiswaSection from './components/SiswaSection.jsx';
import PapanTerpopuler from './components/PapanTerpopuler.jsx';
import FotoKenangan from './components/FotoKenangan.jsx';
import Piket from './components/Piket.jsx';
import JadwalMapel from './components/JadwalMapel.jsx';
import CountdownSection from './components/CountdownSection.jsx';
import LinksSection from './components/LinksSection.jsx';
import MenfessSection from './components/MenfessSection.jsx';
import PesanSection from './components/PesanSection.jsx';
import Footer from './components/Footer.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import ChooserModal from './components/ChooserModal.jsx';
import PhotoModal from './components/PhotoModal.jsx';
import KomentarModal from './components/KomentarModal.jsx';
import FloatingBubbles from './components/FloatingBubbles.jsx';

import { SISWA } from './data/siswa.js';
import useSiswaLikes from './hooks/useSiswaLikes.js';
import useKomentar from './hooks/useKomentar.js';
import usePesanMelayang from './hooks/usePesanMelayang.js';
import useLaguPlayer from './hooks/useLaguPlayer.js';
import useGelembungMimpi from './hooks/useGelembungMimpi.js';

export default function App() {
  useReveal();
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [modal, setModal] = useState(null); // 'chooser' | 'photo' | 'komentar' | null

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modal]);
  const [bubbles, setBubbles] = useState([]);

  const { counts: likeCounts, likedSet, toggleLike } = useSiswaLikes();
  const komentar = useKomentar();
  const laguPlayer = useLaguPlayer();
  const gelembungMimpi = useGelembungMimpi();

  const onPesanBaru = useCallback((id, teks) => {
    setBubbles((prev) => [...prev, { key: id + '-' + Date.now(), text: teks }]);
  }, []);
  const { pesanMap, kirimPesan, hapusPesan } = usePesanMelayang(onPesanBaru);

  const removeBubble = useCallback((key) => {
    setBubbles((prev) => prev.filter((b) => b.key !== key));
  }, []);

  const siswaTerpilih = selectedIdx !== null ? SISWA[selectedIdx] : null;

  const openChooser = (idx) => { setSelectedIdx(idx); setModal('chooser'); };
  const closeChooser = () => setModal(null);

  const openFoto = () => {
    setModal('photo');
    if (siswaTerpilih) laguPlayer.putarUntukSiswa(siswaTerpilih.no);
  };
  const closeFoto = () => { setModal(null); laguPlayer.hentikan(); };

  const openKomentar = () => setModal('komentar');
  const openKomentarByIdx = (idx) => { setSelectedIdx(idx); setModal('komentar'); };
  const closeKomentar = () => setModal(null);

  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <Nav />
      <Hero />
      <WaliKelas />
      <div className="divider" />
      <StrukturTree />
      <div className="divider" />
      <SiswaSection
        likeCounts={likeCounts}
        likedSet={likedSet}
        onToggleLike={toggleLike}
        komentarMap={komentar.komentarMap}
        onCardClick={openChooser}
        onCommentClick={openKomentarByIdx}
        gelembungMimpi={gelembungMimpi}
      />
      <div className="divider" />
      <PapanTerpopuler likeCounts={likeCounts} komentarMap={komentar.komentarMap} />
      <div className="divider" />
      <FotoKenangan />
      <div className="divider" />
      <Piket />
      <div className="divider" />
      <JadwalMapel />
      <div className="divider" />
      <CountdownSection />
      <div className="divider" />
      <LinksSection />
      <div className="divider" />
      <MenfessSection />
      <div className="divider" />
      <PesanSection pesanMap={pesanMap} kirimPesan={kirimPesan} hapusPesan={hapusPesan} />

      <Footer />
      <MusicPlayer />

      <ChooserModal
        siswa={siswaTerpilih}
        open={modal === 'chooser'}
        onClose={closeChooser}
        onPilihKomentar={() => { closeChooser(); openKomentar(); }}
        onPilihFoto={() => { closeChooser(); openFoto(); }}
      />
      <PhotoModal
        siswa={modal === 'photo' ? siswaTerpilih : null}
        open={modal === 'photo'}
        onClose={closeFoto}
        laguPlayer={laguPlayer}
      />
      <KomentarModal
        siswa={modal === 'komentar' ? siswaTerpilih : null}
        open={modal === 'komentar'}
        onClose={closeKomentar}
        komentarMap={komentar.komentarMap}
        likedKomentarSet={komentar.likedKomentarSet}
        kirimKomentar={komentar.kirimKomentar}
        toggleLikeKomentar={komentar.toggleLikeKomentar}
        hapusKomentar={komentar.hapusKomentar}
        likeCounts={likeCounts}
        likedSet={likedSet}
        onToggleLike={toggleLike}
      />

      <FloatingBubbles bubbles={bubbles} onRemove={removeBubble} />
    </>
  );
}
