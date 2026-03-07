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
        <div style={styles.meta}>
          {song.artist}
          {song.duration ? ` · ${formatDuration(song.duration)}` : ''}
        </div>
      </div>
      <button
        style={styles.addBtn}
        onClick={() => onAdd(song)}
        aria-label="Add to queue"
      >
        +
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1px solid #222',
    gap: 12,
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
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 4,
  },
  meta: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: '#dc3232',
    color: '#fff',
    fontSize: 22,
    lineHeight: '1',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, sans-serif',
  },
};
