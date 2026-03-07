import React from 'react';
import { QueueState } from '@karaoke/shared';

interface Props {
  queueState: QueueState;
  onRemove: (songId: string) => void;
}

export default function QueueScreen({ queueState, onRemove }: Props) {
  const { currentSong, queue, mode } = queueState;

  return (
    <div style={styles.container}>
      {mode !== 'idle' && currentSong && (
        <>
          <div style={styles.sectionTitle}>Now Playing</div>
          <div style={styles.nowPlayingCard}>
            <img src={currentSong.thumbnail} alt="" style={styles.thumb} />
            <div style={styles.info}>
              <div style={styles.songTitle}>{currentSong.title}</div>
              <div style={styles.songArtist}>{currentSong.artist}</div>
              <div style={styles.nowPlayingBadge}>
                {mode === 'transition' ? '⏳ Starting soon' : queueState.isPlaying ? '▶ Playing' : '⏸ Paused'}
              </div>
            </div>
          </div>
        </>
      )}

      {queue.length > 0 && (
        <>
          <div style={styles.sectionTitle}>Up Next</div>
          {queue.map((song, i) => (
            <div key={song.id} style={styles.queueItem}>
              <div style={styles.position}>{i + 1}</div>
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
          ))}
        </>
      )}

      {mode === 'idle' && queue.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎵</div>
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
  },
  sectionTitle: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    padding: '8px 16px 4px',
  },
  nowPlayingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    background: '#1a1010',
    borderLeft: '3px solid #dc3232',
    marginBottom: 8,
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderBottom: '1px solid #1a1a1a',
  },
  position: {
    color: '#444',
    fontSize: 13,
    fontFamily: 'system-ui, sans-serif',
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
    color: '#666',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nowPlayingBadge: {
    color: '#dc3232',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 4,
  },
  removeBtn: {
    background: 'none',
    border: '1px solid #333',
    color: '#888',
    fontSize: 18,
    width: 30,
    height: 30,
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    lineHeight: '1',
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
    color: '#555',
    fontSize: 18,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
  },
  emptyHint: {
    color: '#444',
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
  },
};
