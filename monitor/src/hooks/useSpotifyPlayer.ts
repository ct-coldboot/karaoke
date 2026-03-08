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

async function fetchToken(): Promise<string> {
  const res = await fetch('/api/spotify/token');
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json() as { token: string };
  return data.token;
}

async function transferPlayback(deviceId: string, token: string): Promise<void> {
  await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
}

async function startPlaylist(deviceId: string, token: string): Promise<void> {
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      context_uri: PLAYLIST_URI,
      offset: { position: Math.floor(Math.random() * 20) },
    }),
  });
}

export function useSpotifyPlayer(active: boolean) {
  const playerRef = useRef<SpotifyPlayer | null>(null);

  useEffect(() => {
    if (!active) {
      playerRef.current?.disconnect();
      playerRef.current = null;
      return;
    }

    let cancelled = false;

    async function init() {
      // Load SDK script if not already loaded
      if (!document.getElementById('spotify-sdk')) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.id = 'spotify-sdk';
          script.src = 'https://sdk.scdn.co/spotify-player.js';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      function initPlayer() {
        if (cancelled) return;

        fetchToken().then((token) => {
          if (cancelled) return;

          const player = new window.Spotify.Player({
            name: 'Big Echo Home Karaoke',
            getOAuthToken: (cb) => {
              fetchToken().then(cb).catch(() => cb(''));
            },
            volume: 0.4,
          });

          player.addListener('ready', ({ device_id }) => {
            if (cancelled) return;
            fetchToken().then((t) => {
              if (cancelled) return;
              transferPlayback(device_id, t)
                .then(() => startPlaylist(device_id, t))
                .catch((err) => console.warn('Spotify playback start failed:', err));
            }).catch((err) => console.warn('Spotify token fetch failed:', err));
          });

          player.addListener('not_ready', () => {
            console.warn('Spotify player device went offline');
          });

          player.connect().catch((err) => console.warn('Spotify connect failed:', err));
          playerRef.current = player;
        }).catch((err) => console.warn('Spotify init token fetch failed:', err));
      }

      // If SDK already loaded and ready, fire manually
      if (window.Spotify) {
        initPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = initPlayer;
      }
    }

    void init();

    return () => {
      cancelled = true;
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, [active]);
}
