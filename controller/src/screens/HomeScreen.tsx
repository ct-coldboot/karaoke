import React from 'react';
import { QueueState } from '@karaoke/shared';

interface Props {
  queueState: QueueState;
  onGoSearch: () => void;
}

export default function HomeScreen({ queueState, onGoSearch }: Props) {
  const { currentSong, queue, mode } = queueState;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>KARAOKE HOME</div>
        <div style={styles.subtitle}>Your personal karaoke system</div>
      </div>

      <button style={styles.searchBar} onClick={onGoSearch}>
        <span style={styles.searchIcon}>🔍</span>
        <span style={styles.searchPlaceholder}>Search songs...</span>
      </button>

      {mode !== 'idle' && currentSong && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Now Playing</div>
          <div style={styles.nowPlayingCard}>
            <img src={currentSong.thumbnail} alt="" style={styles.nowPlayingThumb} />
            <div style={styles.nowPlayingInfo}>
              <div style={styles.nowPlayingTitle}>{currentSong.title}</div>
              <div style={styles.nowPlayingArtist}>{currentSong.artist}</div>
            </div>
          </div>
        </div>
      )}

      {queue.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Up Next ({queue.length})</div>
          {queue.slice(0, 3).map((song) => (
            <div key={song.id} style={styles.queueItem}>
              <img src={song.thumbnail} alt="" style={styles.queueThumb} />
              <div style={styles.queueInfo}>
                <div style={styles.queueTitle}>{song.title}</div>
                <div style={styles.queueArtist}>{song.artist}</div>
              </div>
            </div>
          ))}
          {queue.length > 3 && (
            <div style={styles.moreItems}>+{queue.length - 3} more in queue</div>
          )}
        </div>
      )}

      {mode === 'idle' && queue.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎤</div>
          <div style={styles.emptyText}>No songs queued</div>
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
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    paddingTop: 8,
  },
  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 900,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#555',
    fontSize: 13,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 4,
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: '#222',
    border: '1px solid #333',
    borderRadius: 10,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    color: '#555',
    fontSize: 15,
    fontFamily: 'system-ui, sans-serif',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nowPlayingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px',
    background: '#1a1a1a',
    borderRadius: 8,
    border: '1px solid #dc3232',
  },
  nowPlayingThumb: {
    width: 72,
    height: 54,
    objectFit: 'cover',
    borderRadius: 4,
    flexShrink: 0,
  },
  nowPlayingInfo: {
    flex: 1,
    minWidth: 0,
  },
  nowPlayingTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nowPlayingArtist: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 4,
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 10px',
    background: '#1a1a1a',
    borderRadius: 8,
  },
  queueThumb: {
    width: 54,
    height: 40,
    objectFit: 'cover',
    borderRadius: 3,
    flexShrink: 0,
  },
  queueInfo: {
    flex: 1,
    minWidth: 0,
  },
  queueTitle: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  queueArtist: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 2,
  },
  moreItems: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    padding: '4px 0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 16px',
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
