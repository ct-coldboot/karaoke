import React, { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import IdleMode from './components/IdleMode';
import TransitionScreen from './components/TransitionScreen';
import PlayingMode from './components/PlayingMode';

export default function App() {
  const { queueState, emitSongEnded } = useSocket();
  const [activated, setActivated] = useState(false);
  // Player lives for the page lifetime — just pauses/plays, never disconnects
  useSpotifyPlayer(activated && queueState.mode === 'idle');

  if (!activated) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setActivated(true)}
      >
        <div style={{ textAlign: 'center', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎤</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>KARAOKE HOME</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
            Click anywhere to activate
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {queueState.mode === 'idle' && <IdleMode />}

      {/* Keep PlayingMode mounted during transition so the next video pre-loads in the background */}
      {(queueState.mode === 'transition' || queueState.mode === 'playing') && queueState.currentSong && (
        <PlayingMode
          song={queueState.currentSong}
          queueState={queueState}
          onEnded={emitSongEnded}
        />
      )}

      {/* Overlay TransitionScreen on top while pre-loading */}
      {queueState.mode === 'transition' && queueState.currentSong && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <TransitionScreen song={queueState.currentSong} />
        </div>
      )}
    </div>
  );
}
