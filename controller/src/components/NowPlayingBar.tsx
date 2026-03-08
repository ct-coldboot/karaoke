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
      <img src={currentSong.thumbnail} alt="" style={styles.thumb} />
      <div style={styles.info}>
        <div style={styles.title}>{currentSong.title}</div>
        <div style={styles.status}>
          {mode === 'transition' ? 'Starting soon...' : isPlaying ? 'Now Playing' : 'Paused'}
        </div>
      </div>
      <div style={styles.controls}>
        {mode === 'playing' && (
          isPlaying ? (
            <button style={styles.btn} onClick={onPause} aria-label="Pause">⏸</button>
          ) : (
            <button style={styles.btn} onClick={onResume} aria-label="Resume">▶</button>
          )
        )}
        <button style={styles.btn} onClick={onSkip} aria-label="Skip">⏭</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'linear-gradient(90deg, #1a0008, #200010, #1a0008)',
    borderTop: '2px solid #e60026',
    gap: 12,
    height: 64,
    flexShrink: 0,
    boxShadow: '0 -4px 20px rgba(230,0,38,0.3)',
  },
  thumb: {
    width: 48,
    height: 36,
    objectFit: 'cover',
    borderRadius: 3,
    flexShrink: 0,
    background: '#333',
    border: '1px solid #e60026',
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
  status: {
    color: '#ffd700',
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
  btn: {
    background: 'rgba(230,0,38,0.15)',
    border: '1px solid #e60026',
    color: '#fff',
    fontSize: 18,
    width: 36,
    height: 36,
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
