import React from 'react';
import { SearchResult } from '@karaoke/shared';

interface Props {
  song: SearchResult;
  onAdd: (song: SearchResult) => void;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SongCard({ song, onAdd }: Props) {
  return (
    <div style={styles.card}>
      <img src={song.thumbnail} alt="" style={styles.thumb} />
      <div style={styles.info}>
        <div style={styles.title}>{song.title}</div>
        <div style={styles.artist}>{song.artist}</div>
        {song.duration ? (
          <div style={styles.duration}>{formatDuration(song.duration)}</div>
        ) : null}
      </div>
      <button
        style={styles.addBtn}
        onClick={() => onAdd(song)}
        aria-label="Add to queue"
      >
        Add to Queue
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    gap: 12,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderLeft: '3px solid #ff0066',
    borderRadius: 6,
    marginBottom: 8,
  },
  thumb: {
    width: 72,
    height: 54,
    objectFit: 'cover',
    borderRadius: 4,
    flexShrink: 0,
    background: '#222',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 4,
  },
  artist: {
    color: '#ff6699',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  duration: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
  },
  addBtn: {
    padding: '6px 14px',
    borderRadius: 20,
    border: 'none',
    background: 'linear-gradient(135deg, #00eeff, #0088ff)',
    color: '#001a2a',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },
};
