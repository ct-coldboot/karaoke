import React from 'react';
import { Song } from '@karaoke/shared';

interface Props {
  song: Song;
}

export default function TransitionScreen({ song }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.brandBox}>
            <span style={styles.brandText}>Karaoke Home</span>
          </div>
          <div style={styles.infoLabel}>information</div>
        </div>
        <div style={styles.divider} />
        <div style={styles.upNext}>
          <span style={styles.arrow}>▶</span>
          <span style={styles.upNextLabel}>Up Next</span>
        </div>
        <div style={styles.songTitle}>{song.title}</div>
        <div style={styles.songArtist}>{song.artist}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 640,
    background: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
  },
  header: {
    background: '#dc3232',
    padding: '20px 28px 16px',
    display: 'flex',
    alignItems: 'baseline',
    gap: 16,
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
  },
  brandText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 900,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 1,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  divider: {
    height: 3,
    background: '#b02020',
  },
  upNext: {
    padding: '24px 28px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  arrow: {
    color: '#dc3232',
    fontSize: 18,
  },
  upNextLabel: {
    color: '#dc3232',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  songTitle: {
    padding: '4px 28px 8px',
    fontSize: 36,
    fontWeight: 900,
    color: '#111',
    fontFamily: 'system-ui, sans-serif',
    lineHeight: 1.2,
  },
  songArtist: {
    padding: '0 28px 28px',
    fontSize: 22,
    color: '#555',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 400,
  },
};
