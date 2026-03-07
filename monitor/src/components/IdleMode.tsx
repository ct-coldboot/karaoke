import React from 'react';

export default function IdleMode() {
  return (
    <div style={styles.container}>
      <div style={styles.logo}>
        <div style={styles.brand}>KARAOKE</div>
        <div style={styles.subtitle}>HOME</div>
      </div>
      <div style={styles.hint}>Search for a song on your phone to get started</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  logo: {
    textAlign: 'center',
    marginBottom: 32,
  },
  brand: {
    fontSize: 96,
    fontWeight: 900,
    letterSpacing: 16,
    fontFamily: 'system-ui, sans-serif',
    color: '#fff',
    textShadow: '0 0 40px rgba(220, 50, 50, 0.8)',
  },
  subtitle: {
    fontSize: 36,
    fontWeight: 300,
    letterSpacing: 24,
    color: '#dc3232',
    fontFamily: 'system-ui, sans-serif',
    marginTop: -8,
  },
  hint: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'system-ui, sans-serif',
    marginTop: 48,
    letterSpacing: 1,
  },
};
