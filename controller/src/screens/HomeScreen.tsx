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
        <div style={styles.logo}>♪ KARAOKE HOME</div>
        <div style={styles.subtitle}>カラオケホーム · YOUR PERSONAL KARAOKE SYSTEM</div>

        <button style={styles.searchBar} onClick={onGoSearch}>
          <span style={styles.searchIcon}>🔍</span>
          <span style={styles.searchPlaceholder}>Search songs...</span>
        </button>
      </div>

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
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  header: {
    background: 'linear-gradient(135deg, #1a0000 0%, #2d0010 60%, #1a0000 100%)',
    borderBottom: '2px solid #e60026',
    padding: '16px 16px 12px',
    boxShadow: '0 4px 16px rgba(230,0,38,0.3)',
  },
  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 900,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 3,
    textShadow: '0 0 20px rgba(230,0,38,0.8)',
  },
  subtitle: {
    color: '#ffd700',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 2,
    letterSpacing: 2,
    fontWeight: 600,
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid #e60026',
    borderRadius: 10,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    marginTop: 10,
    boxSizing: 'border-box',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    color: '#888',
    fontSize: 15,
    fontFamily: 'system-ui, sans-serif',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '14px 16px 0',
  },
  sectionTitle: {
    color: '#ffd700',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadow: '0 0 8px rgba(255,215,0,0.4)',
  },
  nowPlayingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px',
    background: 'linear-gradient(90deg, #1a0008, #200010)',
    borderRadius: 8,
    border: '1px solid #e60026',
    boxShadow: '0 0 16px rgba(230,0,38,0.25)',
  },
  nowPlayingThumb: {
    width: 72,
    height: 54,
    objectFit: 'cover',
    borderRadius: 4,
    flexShrink: 0,
    border: '1px solid #e60026',
  },
  nowPlayingInfo: {
    flex: 1,
    minWidth: 0,
  },
  nowPlayingTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nowPlayingArtist: {
    color: '#ffd700',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 4,
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 10px',
    background: '#1a1010',
    borderRadius: 6,
    border: '1px solid #2a1010',
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
    color: '#888',
    fontSize: 11,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 2,
  },
  moreItems: {
    color: '#ffd700',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    padding: '4px 0',
    opacity: 0.6,
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
