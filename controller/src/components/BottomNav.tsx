import React from 'react';

export type Tab = 'home' | 'search' | 'queue';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  queueCount: number;
}

const TAB_ACCENT: Record<Tab, string> = {
  home: '#ff0066',
  search: '#00eeff',
  queue: '#ffe600',
};

export default function BottomNav({ activeTab, onTabChange, queueCount }: Props) {
  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'queue', label: 'Queue', icon: '🎵' },
  ];

  return (
    <div style={styles.nav}>
      {/* Rainbow gradient top border */}
      <div style={styles.rainbowBar} />

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const accent = TAB_ACCENT[tab.id];

        return (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(isActive ? { background: `rgba(${hexToRgb(accent)}, 0.08)` } : {}),
            }}
            onClick={() => onTabChange(tab.id)}
          >
            {/* Glow indicator bar at bottom of active tab */}
            {isActive && (
              <div
                style={{
                  ...styles.glowBar,
                  background: accent,
                  boxShadow: `0 0 8px 2px ${accent}`,
                }}
              />
            )}

            <span
              style={{
                ...styles.icon,
                filter: isActive ? `drop-shadow(0 0 4px ${accent})` : 'none',
              }}
            >
              {tab.icon}
            </span>

            <span
              style={{
                ...styles.label,
                color: isActive ? accent : 'rgba(255,255,255,0.4)',
                textShadow: isActive ? `0 0 8px ${accent}` : 'none',
              }}
            >
              {tab.label}
            </span>

            {tab.id === 'queue' && queueCount > 0 && (
              <span style={styles.badge}>{queueCount}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Convert a 6-digit hex color to an "r,g,b" string for use in rgba(). */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'relative',
    display: 'flex',
    height: 64,
    background: '#0a0014',
    flexShrink: 0,
  },
  rainbowBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background:
      'linear-gradient(90deg, #ff0066, #ff6600, #ffe600, #00eeff, #aa00ff, #ff0066)',
    zIndex: 1,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: '8px 0 4px',
    transition: 'background 0.15s ease',
  },
  glowBar: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: '2px 2px 0 0',
  },
  icon: {
    fontSize: 20,
    lineHeight: 1,
    transition: 'filter 0.15s ease',
  },
  label: {
    fontSize: 10,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 0.8,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    transition: 'color 0.15s ease, text-shadow 0.15s ease',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 'calc(50% - 20px)',
    background: 'linear-gradient(135deg, #ffe600, #ffaa00)',
    color: '#0a0014',
    fontSize: 9,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 700,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    boxShadow: '0 0 6px rgba(255,230,0,0.7)',
  },
};
