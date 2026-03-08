import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SearchResult } from '@karaoke/shared';
import SongCard from '../components/SongCard';

type Lang = 'all' | 'en' | 'ja';

interface Props {
  onAdd: (song: SearchResult) => void;
}

export default function SearchScreen({ onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<Lang>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string, l: Lang) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${l}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json() as { results: SearchResult[] };
      setResults(data.results);
    } catch {
      setError('Search failed. Is yt-dlp installed?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void search(query, lang);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, lang, search]);

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2000);
  }

  function handleAdd(song: SearchResult) {
    onAdd(song);
    showToast(`Added: ${song.title}`);
  }

  const langTabs: Array<{ id: Lang; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'en', label: 'English' },
    { id: 'ja', label: '日本語' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.searchArea}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div style={styles.tabs}>
          {langTabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(lang === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => setLang(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.results}>
        {loading && (
          <div style={styles.statusText}>Searching...</div>
        )}
        {error && (
          <div style={{ ...styles.statusText, color: '#dc3232' }}>{error}</div>
        )}
        {!loading && !error && results.length === 0 && query.trim() && (
          <div style={styles.statusText}>No results found</div>
        )}
        {!loading && !error && results.length === 0 && !query.trim() && (
          <div style={styles.statusText}>Type to search for songs</div>
        )}
        {results.map((song) => (
          <SongCard key={song.youtubeId} song={song} onAdd={handleAdd} />
        ))}
      </div>

      {toast && (
        <div style={styles.toast}>{toast}</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  searchArea: {
    padding: '12px 16px 0',
    background: 'linear-gradient(135deg, #1a0000 0%, #2d0010 60%, #1a0000 100%)',
    borderBottom: '2px solid #e60026',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(230,0,38,0.3)',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid #e60026',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'system-ui, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  },
  tabs: {
    display: 'flex',
    gap: 0,
    marginTop: 10,
    borderBottom: 'none',
  },
  tab: {
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    marginBottom: 0,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  tabActive: {
    color: '#ffd700',
    borderBottom: '3px solid #ffd700',
    textShadow: '0 0 8px rgba(255,215,0,0.5)',
  },
  results: {
    flex: 1,
    overflowY: 'auto',
  },
  statusText: {
    color: '#555',
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    padding: '32px 16px',
  },
  toast: {
    position: 'fixed',
    bottom: 140,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #cc0020, #e60026)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: 20,
    fontSize: 13,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 700,
    maxWidth: '80%',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    zIndex: 100,
    boxShadow: '0 4px 20px rgba(230,0,38,0.6)',
    letterSpacing: 0.5,
  },
};
