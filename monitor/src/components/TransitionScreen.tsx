import React, { useEffect, useState } from 'react';
import { Song } from '@karaoke/shared';
import BigInuLogo from './BigInuLogo';
import { speakTTS, cancelTTS } from '../utils/tts';

interface Props {
  song: Song;
}

const INTROS = [
  (title: string, artist: string) => `次は、${artist}で${title}！`,
  (title: string, artist: string) => `${title}、${artist}！どうぞ！`,
  (title: string, artist: string) => `${artist}の${title}！レッツゴー！`,
  (title: string, artist: string) => `次の曲は${title}！${artist}！`,
  (title: string, artist: string) => `${title}、いきまーす！`,
];

function announce(title: string, artist: string) {
  const template = INTROS[Math.floor(Math.random() * INTROS.length)];
  speakTTS(template(title, artist), 'ja-JP', { rate: 0.95, pitch: 1.1 });
}

export default function TransitionScreen({ song }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    announce(song.title, song.artist);
    return () => { cancelTTS(); };
  }, [song.title, song.artist]);

  return (
    <div style={styles.container}>
      <div style={styles.bg} />
      <div style={styles.topStripe} />
      <div
        style={{
          ...styles.content,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <div style={styles.badge}>▶ UP NEXT</div>
        <div style={styles.title}>{song.title}</div>
        <div style={styles.artist}>{song.artist}</div>
      </div>
      <div style={styles.bottomStripe} />
      <div style={styles.watermark}>
        <BigInuLogo width={160} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: '#0a0014',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(255,0,102,0.15) 0%, rgba(0,0,20,0) 40%, rgba(0,238,255,0.12) 100%)',
    pointerEvents: 'none',
  },
  topStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    background:
      'linear-gradient(90deg, #ff0066, #ffe600, #00eeff, #cc00ff, #ff0066)',
    backgroundSize: '200% 100%',
    animation: 'stripe 3s linear infinite',
  },
  bottomStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    background:
      'linear-gradient(90deg, #00eeff, #ff0066, #ffe600, #cc00ff, #00eeff)',
    backgroundSize: '200% 100%',
    animation: 'stripe 3s linear infinite reverse',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    zIndex: 1,
    padding: '0 60px',
    textAlign: 'center',
  },
  badge: {
    background: 'linear-gradient(135deg, #ff0066, #cc0099)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: 4,
    padding: '8px 28px',
    borderRadius: 40,
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 0 20px rgba(255,0,102,0.5)',
  },
  title: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: 900,
    fontFamily: 'system-ui, sans-serif',
    textShadow: '0 0 30px rgba(255,0,102,0.6), 0 2px 8px rgba(0,0,0,0.8)',
    lineHeight: 1.1,
  },
  artist: {
    color: '#00eeff',
    fontSize: 28,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 500,
    textShadow: '0 0 20px rgba(0,238,255,0.5)',
  },
  watermark: {
    position: 'absolute',
    bottom: 24,
    right: 32,
    opacity: 0.7,
  },
};
