import React from 'react';
import { QueueState } from '@karaoke/shared';

interface Props {
  queueState: QueueState;
  onSkip: () => void;
  onPause: () => void;
  onResume: () => void;
}

export default function NowPlayingBar({ queueState, onSkip, onPause, onResume }: Props) {
  const { currentSong, mode, isPlaying } = queueState;
  if (mode === 'idle' || !currentSong) return null;

  return (
    <div style={styles.bar}>
      <style>{`
        @keyframes npb-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
      <div style={styles.dot} aria-hidden="true" />
      <img src={currentSong.thumbnail} alt="" style={styles.thumb} />
      <div style={styles.info}>
        <div style={styles.title}>{currentSong.title}</div>
        <div style={styles.artist}>
          {mode === 'transition' ? 'Starting soon...' : isPlaying ? 'Now Playing' : 'Paused'}
        </div>
      </div>
      <div style={styles.controls}>
        {mode === 'playing' && (
          isPlaying ? (
            <button style={styles.pauseBtn} onClick={onPause} aria-label="Pause">⏸</button>
          ) : (
            <button style={styles.pauseBtn} onClick={onResume} aria-label="Resume">▶</button>
          )
        )}
        <button style={styles.skipBtn} onClick={onSkip} aria-label="Skip">⏭</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #1a0033, #330011)',
    borderTop: '2px solid #ff0066',
    gap: 12,
    height: 64,
    flexShrink: 0,
    boxShadow: '0 -4px 24px rgba(255,0,102,0.35)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#ff0066',
    flexShrink: 0,
    boxShadow: '0 0 6px #ff0066',
    animation: 'npb-pulse 1.4s ease-in-out infinite',
  },
  thumb: {
    width: 48,
    height: 36,
    objectFit: 'cover',
    borderRadius: 3,
    flexShrink: 0,
    background: '#333',
    border: '1px solid #ff0066',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  artist: {
    color: '#ff6699',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 2,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  controls: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
  },
  pauseBtn: {
    background: 'rgba(255,0,102,0.15)',
    border: '1px solid #ff0066',
    color: '#ff0066',
    fontSize: 18,
    width: 36,
    height: 36,
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(255,0,102,0.5)',
  },
  skipBtn: {
    background: 'rgba(0,238,255,0.1)',
    border: '1px solid #00eeff',
    color: '#00eeff',
    fontSize: 18,
    width: 36,
    height: 36,
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(0,238,255,0.4)',
  },
};
