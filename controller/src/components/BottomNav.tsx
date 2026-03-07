import React from 'react';

export type Tab = 'home' | 'search' | 'queue';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  queueCount: number;
}

export default function BottomNav({ activeTab, onTabChange, queueCount }: Props) {
  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'queue', label: 'Queue', icon: '🎵' },
  ];

  return (
    <div style={styles.nav}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={{
            ...styles.tab,
            ...(activeTab === tab.id ? styles.tabActive : {}),
          }}
          onClick={() => onTabChange(tab.id)}
        >
          <span style={styles.icon}>{tab.icon}</span>
          <span style={styles.label}>{tab.label}</span>
          {tab.id === 'queue' && queueCount > 0 && (
            <span style={styles.badge}>{queueCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    height: 56,
    background: '#181818',
    borderTop: '1px solid #2a2a2a',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: '6px 0',
  },
  tabActive: {
    borderTop: '2px solid #dc3232',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 'calc(50% - 18px)',
    background: '#dc3232',
    color: '#fff',
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
  },
};
