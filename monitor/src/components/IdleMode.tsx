import React from 'react';

export default function IdleMode() {
  return (
    <div style={styles.container}>
      {/* Top accent bar */}
      <div style={styles.topBar}>
        <span style={styles.topBarNote}>♪</span>
        <span style={styles.topBarText}>NOW ACCEPTING REQUESTS</span>
        <span style={styles.topBarNote}>♬</span>
      </div>

      {/* Center logo block */}
      <div style={styles.center}>
        {/* Logo badge */}
        <div style={styles.badge}>
          <div style={styles.badgeInner}>
            <div style={styles.badgeKana}>カラオケ</div>
            <div style={styles.badgeLatin}>KARAOKE HOME</div>
          </div>
          <div style={styles.badgeNote}>♩</div>
        </div>

        {/* Big tagline */}
        <div style={styles.tagline}>うたおう！</div>
        <div style={styles.taglineSub}>Let's Sing!</div>

        <div style={styles.dividerLine} />
        <div style={styles.hint}>スマートフォンで曲を検索 · Search for a song on your phone</div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <span style={styles.bottomBarItem}>♪ KARAOKE HOME</span>
        <span style={styles.bottomBarDot}>◆</span>
        <span style={styles.bottomBarItem}>HIGH QUALITY KARAOKE</span>
        <span style={styles.bottomBarDot}>◆</span>
        <span style={styles.bottomBarItem}>ENJOY YOUR SONG ♪</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(160deg, #1a0000 0%, #2d0010 25%, #0a0020 60%, #000 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  topBar: {
    width: '100%',
    background: 'linear-gradient(90deg, #b80000, #e60026, #b80000)',
    padding: '10px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    boxShadow: '0 4px 24px rgba(230,0,38,0.5)',
    flexShrink: 0,
  },
  topBarNote: {
    fontSize: 22,
    color: '#ffd700',
    textShadow: '0 0 8px rgba(255,215,0,0.8)',
  },
  topBarText: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: 6,
    fontFamily: 'system-ui, sans-serif',
    color: '#fff',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: 'linear-gradient(135deg, #cc0020, #ff1a3c)',
    border: '3px solid #ffd700',
    borderRadius: 8,
    padding: '16px 40px',
    marginBottom: 40,
    boxShadow: '0 0 40px rgba(230,0,38,0.7), inset 0 1px 0 rgba(255,255,255,0.15)',
  },
  badgeInner: {
    textAlign: 'center',
  },
  badgeKana: {
    fontSize: 20,
    fontWeight: 900,
    color: '#ffd700',
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 6,
    textShadow: '0 0 12px rgba(255,215,0,0.6)',
  },
  badgeLatin: {
    fontSize: 32,
    fontWeight: 900,
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 4,
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  badgeNote: {
    fontSize: 48,
    color: '#ffd700',
    textShadow: '0 0 16px rgba(255,215,0,0.8)',
    lineHeight: 1,
  },
  tagline: {
    fontSize: 72,
    fontWeight: 900,
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 12,
    textShadow: '0 0 60px rgba(230,0,38,0.9), 0 0 120px rgba(230,0,38,0.4)',
  },
  taglineSub: {
    fontSize: 28,
    fontWeight: 300,
    color: '#ffd700',
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 16,
    marginTop: 4,
    textShadow: '0 0 20px rgba(255,215,0,0.6)',
  },
  dividerLine: {
    width: 320,
    height: 2,
    background: 'linear-gradient(90deg, transparent, #e60026, #ffd700, #e60026, transparent)',
    margin: '32px 0 20px',
  },
  hint: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 1,
    textAlign: 'center',
  },
  bottomBar: {
    width: '100%',
    background: 'rgba(0,0,0,0.6)',
    borderTop: '2px solid #e60026',
    padding: '10px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    flexShrink: 0,
  },
  bottomBarItem: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'system-ui, sans-serif',
  },
  bottomBarDot: {
    fontSize: 8,
    color: '#e60026',
  },
};
