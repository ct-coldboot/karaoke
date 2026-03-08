import React from 'react';
import { Song } from '@karaoke/shared';

interface Props {
  song: Song;
}

export default function TransitionScreen({ song }: Props) {
  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.bg} />

      {/* Card */}
      <div style={styles.card}>
        {/* Header: logo bar */}
        <div style={styles.header}>
          <div style={styles.logoMark}>
            <span style={styles.logoNote}>♪</span>
            <div style={styles.logoTextBlock}>
              <div style={styles.logoKana}>カラオケ</div>
              <div style={styles.logoLatin}>KARAOKE HOME</div>
            </div>
            <span style={styles.logoNote}>♬</span>
          </div>
          <div style={styles.infoTag}>インフォメーション · INFORMATION</div>
        </div>

        {/* Gold accent bar */}
        <div style={styles.goldBar} />

        {/* Body */}
        <div style={styles.body}>
          <div style={styles.upNextRow}>
            <span style={styles.upNextArrow}>▶▶</span>
            <span style={styles.upNextLabel}>UP NEXT · 次の曲</span>
          </div>
          <div style={styles.songTitle}>{song.title}</div>
          <div style={styles.songArtist}>{song.artist}</div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>♩ Please prepare to sing ♩</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, #1a0000 0%, #2d0010 30%, #0a0020 70%, #000 100%)',
  },
  card: {
    position: 'relative',
    width: 680,
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 0 80px rgba(230,0,38,0.5), 0 20px 60px rgba(0,0,0,0.8)',
    border: '2px solid #ffd700',
  },
  header: {
    background: 'linear-gradient(135deg, #cc0020 0%, #ff1a3c 50%, #cc0020 100%)',
    padding: '20px 28px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  logoMark: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoNote: {
    fontSize: 28,
    color: '#ffd700',
    textShadow: '0 0 10px rgba(255,215,0,0.8)',
  },
  logoTextBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoKana: {
    fontSize: 13,
    fontWeight: 700,
    color: '#ffd700',
    letterSpacing: 4,
    fontFamily: 'system-ui, sans-serif',
    textShadow: '0 0 8px rgba(255,215,0,0.6)',
  },
  logoLatin: {
    fontSize: 26,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: 2,
    fontFamily: 'system-ui, sans-serif',
    textShadow: '0 2px 6px rgba(0,0,0,0.4)',
    lineHeight: 1,
  },
  infoTag: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    letterSpacing: 3,
    fontFamily: 'system-ui, sans-serif',
    marginLeft: 2,
  },
  goldBar: {
    height: 4,
    background: 'linear-gradient(90deg, #b8860b, #ffd700, #ffa500, #ffd700, #b8860b)',
  },
  body: {
    background: '#fff',
    padding: '28px 32px 24px',
  },
  upNextRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  upNextArrow: {
    color: '#e60026',
    fontSize: 14,
    letterSpacing: -2,
  },
  upNextLabel: {
    color: '#e60026',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 3,
    fontFamily: 'system-ui, sans-serif',
    textTransform: 'uppercase',
  },
  songTitle: {
    fontSize: 40,
    fontWeight: 900,
    color: '#111',
    fontFamily: 'system-ui, sans-serif',
    lineHeight: 1.2,
    marginBottom: 8,
  },
  songArtist: {
    fontSize: 22,
    color: '#555',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 400,
  },
  footer: {
    background: '#111',
    padding: '10px 32px',
    display: 'flex',
    justifyContent: 'center',
  },
  footerText: {
    color: '#ffd700',
    fontSize: 13,
    letterSpacing: 3,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
    textShadow: '0 0 8px rgba(255,215,0,0.5)',
  },
};
