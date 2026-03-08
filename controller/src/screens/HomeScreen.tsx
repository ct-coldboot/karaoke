import React from 'react';
import { QueueState } from '@karaoke/shared';

interface Props {
  queueState: QueueState;
  name: string;
  onNameChange: (name: string) => void;
  onGoSearch: () => void;
}

export default function HomeScreen({ queueState, name, onNameChange, onGoSearch }: Props) {
  const { currentSong, queue, mode } = queueState;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoStrip}>
          <div style={styles.logoText}>BIG ECHO</div>
          <div style={styles.logoSub}>Karaoke Entertainment</div>
        </div>

        <input
          style={styles.nameInput}
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={30}
        />

        <button style={styles.searchBar} onClick={onGoSearch}>
          <span style={styles.searchIcon}>🔍</span>
          <span style={styles.searchPlaceholder}>Search songs...</span>
        </button>
      </div>

      {/* Now Playing */}
      {mode !== 'idle' && currentSong && (
        <div style={styles.section}>
          <div style={sectionPill('#ff0066')}>NOW PLAYING</div>
          <div style={styles.nowPlayingCard}>
            <img src={currentSong.thumbnail} alt="" style={styles.nowPlayingThumb} />
            <div style={styles.nowPlayingInfo}>
              <div style={styles.nowPlayingTitle}>{currentSong.title}</div>
              <div style={styles.nowPlayingArtist}>{currentSong.artist}</div>
            </div>
          </div>
        </div>
      )}

      {/* Up Next */}
      {queue.length > 0 && (
        <div style={styles.section}>
          <div style={sectionPill('#00eeff')}>UP NEXT ({queue.length})</div>
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

      {/* Empty state */}
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

function sectionPill(color: string): React.CSSProperties {
  return {
    display: 'inline-block',
    alignSelf: 'flex-start',
    background: `${color}22`,
    border: `1px solid ${color}`,
    color: color,
    fontSize: 10,
    fontWeight: 800,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 2,
    textTransform: 'uppercase',
    borderRadius: 20,
    padding: '3px 10px',
  };
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    background: '#0a0014',
  },
  header: {
    padding: '12px 16px 14px',
    background: '#0a0014',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  logoStrip: {
    background: '#cc0000',
    borderRadius: 6,
    padding: '8px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 900,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 4,
    lineHeight: 1,
  },
  logoSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 2,
    fontWeight: 600,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  nameInput: {
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,230,0,0.4)',
    borderRadius: 10,
    color: '#ffe600',
    fontSize: 15,
    fontFamily: 'system-ui, sans-serif',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid #ff0066',
    borderRadius: 10,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box',
    boxShadow: '0 0 10px rgba(255,0,102,0.15)',
  },
  searchIcon: {
    fontSize: 15,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 15,
    fontFamily: 'system-ui, sans-serif',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '14px 16px 0',
  },
  nowPlayingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px',
    background: 'rgba(255,0,102,0.06)',
    borderRadius: 8,
    border: '1px solid rgba(255,0,102,0.3)',
    boxShadow: '0 0 12px rgba(255,0,102,0.1)',
  },
  nowPlayingThumb: {
    width: 72,
    height: 54,
    objectFit: 'cover',
    borderRadius: 4,
    flexShrink: 0,
    border: '1px solid rgba(255,0,102,0.4)',
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
    color: '#ff0066',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    marginTop: 4,
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 10px',
    background: 'rgba(0,238,255,0.04)',
    borderRadius: 6,
    border: '1px solid rgba(0,238,255,0.12)',
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
    color: '#00eeff',
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
    color: '#00eeff',
    fontSize: 18,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
  },
  emptyHint: {
    color: 'rgba(0,238,255,0.5)',
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
  },
};
