/// <reference types="vite/client" />
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: 'ready', cb: (state: { device_id: string }) => void): void;
  addListener(event: 'not_ready', cb: (state: { device_id: string }) => void): void;
  addListener(event: string, cb: (state: unknown) => void): void;
}

const PLAYLIST_URI = (import.meta.env.VITE_SPOTIFY_PLAYLIST_URI as string | undefined)
  ?? 'spotify:playlist:37i9dQZF1DX9tPFwDMOaN1';

// Module-level singleton — survives React StrictMode double-invocation
let sdkReady = false;
let deviceId: string | null = null;
let onReadyCallbacks: Array<(id: string) => void> = [];

async function fetchToken(): Promise<string> {
  const res = await fetch('/api/spotify/token');
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json() as { token: string };
  return data.token;
}

async function startPlaylist(id: string, token: string, attempt = 0): Promise<void> {
  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context_uri: PLAYLIST_URI,
      offset: { position: Math.floor(Math.random() * 20) },
    }),
  });
  if (res.status === 404 && attempt < 4) {
    await new Promise((r) => setTimeout(r, 1500));
    return startPlaylist(id, token, attempt + 1);
  }
}

async function pausePlayback(id: string, token: string): Promise<void> {
  await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

function ensureSDK() {
  if (sdkReady) return;
  sdkReady = true; // guard against double-call from StrictMode

  function initPlayer() {
    fetchToken().then((token) => {
      const player = new window.Spotify.Player({
        name: 'Big Echo Home Karaoke',
        getOAuthToken: (cb) => { fetchToken().then(cb).catch(() => cb('')); },
        volume: 0.4,
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('[Spotify] Player ready, device_id:', device_id);
        deviceId = device_id;
        onReadyCallbacks.forEach((cb) => cb(device_id));
        onReadyCallbacks = [];
      });

      player.addListener('not_ready', () => {
        console.warn('[Spotify] Device went offline');
        deviceId = null;
      });

      player.connect().catch((err) => console.warn('[Spotify] connect failed:', err));
    }).catch((err) => console.warn('[Spotify] init token fetch failed:', err));
  }

  if (!document.getElementById('spotify-sdk')) {
    const script = document.createElement('script');
    script.id = 'spotify-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    document.head.appendChild(script);
  }

  if (window.Spotify) {
    initPlayer();
  } else {
    window.onSpotifyWebPlaybackSDKReady = initPlayer;
  }
}

function whenReady(cb: (id: string) => void) {
  if (deviceId) {
    cb(deviceId);
  } else {
    onReadyCallbacks.push(cb);
  }
}

/**
 * Controls Spotify idle music. The SDK initializes once per page load.
 * `playing=true` starts/resumes the playlist; `playing=false` pauses it.
 */
export function useSpotifyPlayer(playing: boolean) {
  const playingRef = useRef(playing);
  playingRef.current = playing;

  // Initialize SDK once (module-level guard prevents StrictMode double-init)
  useEffect(() => {
    ensureSDK();
  }, []);

  // Play or pause when idle state changes
  useEffect(() => {
    if (playing) {
      whenReady((id) => {
        // Small delay to let Spotify backend register device on first connect
        setTimeout(() => {
          if (!playingRef.current) return;
          fetchToken()
            .then((t) => startPlaylist(id, t))
            .catch((err) => console.warn('[Spotify] startPlaylist failed:', err));
        }, 1000);
      });
    } else {
      if (deviceId) {
        fetchToken()
          .then((t) => pausePlayback(deviceId!, t))
          .catch((err) => console.warn('[Spotify] pausePlayback failed:', err));
      }
    }
  }, [playing]);
}
