import React from 'react';
import { QueueState } from '@karaoke/shared';

interface Props {
  queueState: QueueState;
  onRemove: (songId: string) => void;
}

function getPositionColor(position: number): string {
  if (position === 1) return '#ff0066';
  if (position === 2) return '#00eeff';
  if (position === 3) return '#ffe600';
  return 'rgba(255,255,255,0.5)';
}

export default function QueueScreen({ queueState, onRemove }: Props) {
  const { currentSong, queue, mode } = queueState;

  return (
    <div style={styles.container}>
      {mode !== 'idle' && currentSong && (
        <>
          <div style={styles.sectionHeader}>
            <span style={styles.nowPlayingBadge}>
              {mode === 'transition' ? '⏳ Starting soon' : queueState.isPlaying ? '▶ Now Playing' : '⏸ Paused'}
            </span>
          </div>
          <div style={styles.nowPlayingCard}>
            <img src={currentSong.thumbnail} alt="" style={styles.thumb} />
            <div style={styles.info}>
              <div style={styles.songTitle}>{currentSong.title}</div>
              <div style={styles.songArtist}>{currentSong.artist}</div>
            </div>
          </div>
        </>
      )}

      {queue.length > 0 && (
        <>
          <div style={styles.sectionTitle}>Up Next</div>
          {queue.map((song, i) => {
            const posColor = getPositionColor(i + 1);
            return (
              <div
                key={song.id}
                style={{
                  ...styles.queueItem,
                  borderLeft: `3px solid ${posColor}`,
                }}
              >
                <div style={{ ...styles.position, color: posColor }}>{i + 1}</div>
                <img src={song.thumbnail} alt="" style={styles.thumb} />
                <div style={styles.info}>
                  <div style={styles.songTitle}>{song.title}</div>
                  <div style={styles.songArtist}>{song.artist}</div>
                </div>
                <button
                  style={styles.removeBtn}
                  onClick={() => onRemove(song.id)}
                  aria-label="Remove from queue"
                >
                  ×
                </button>
              </div>
            );
          })}
        </>
      )}

      {mode === 'idle' && queue.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎤</div>
          <div style={styles.emptyText}>Queue is empty</div>
          <div style={styles.emptyHint}>Search for a song to get started!</div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
    background: '#0a0014',
  },
  sectionHeader: {
    padding: '10px 16px 6px',
  },
  nowPlayingBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #ff0066, #cc0099)',
    color: '#fff',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 800,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: 20,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: 'uppercase',
    padding: '10px 16px 4px',
  },
  nowPlayingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderLeft: '3px solid #ff0066',
    marginBottom: 8,
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 8,
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    marginBottom: 6,
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  position: {
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 900,
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  thumb: {
    width: 60,
    height: 45,
    objectFit: 'cover',
    borderRadius: 3,
    flexShrink: 0,
    background: '#222',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  songTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  songArtist: {
    color: '#ff6699',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  removeBtn: {
    background: 'rgba(255,0,102,0.15)',
    border: '1px solid rgba(255,0,102,0.3)',
    color: '#ff0066',
    fontSize: 18,
    width: 30,
    height: 30,
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 16px',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    color: '#00eeff',
    fontSize: 18,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
  },
  emptyHint: {
    color: 'rgba(0,238,255,0.6)',
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
  },
};
