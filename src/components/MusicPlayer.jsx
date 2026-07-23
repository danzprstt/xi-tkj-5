import { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play().catch(() => {});
    setPlaying((p) => !p);
  };

  return (
    <div className="music-player">
      <audio ref={audioRef} loop>
        <source src="/audio.mp3" type="audio/mpeg" />
      </audio>
      <div className="music-cover">
        <img src="/thumbnail.jpg" alt="cover" />
      </div>
      <div className="music-meta">
        <div className="music-title">The night is still young</div>
        <div className="music-artist">nicky minaj</div>
      </div>
      <button className={'play-btn' + (playing ? ' playing' : '')} onClick={toggleMusic}>
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </div>
  );
}
