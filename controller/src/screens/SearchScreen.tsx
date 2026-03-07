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
    background: '#111',
    flexShrink: 0,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#222',
    border: '1px solid #333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'system-ui, sans-serif',
    outline: 'none',
  },
  tabs: {
    display: 'flex',
    gap: 0,
    marginTop: 10,
    borderBottom: '1px solid #222',
  },
  tab: {
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
  },
  tabActive: {
    color: '#fff',
    borderBottom: '2px solid #dc3232',
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
    background: '#dc3232',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: 20,
    fontSize: 13,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
    maxWidth: '80%',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
};
