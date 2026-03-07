import React, { useEffect, useRef } from 'react';
import { Song, QueueState } from '@karaoke/shared';

interface Props {
  song: Song;
  queueState: QueueState;
  onEnded: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
}

let ytApiLoaded = false;
let ytApiCallbacks: Array<() => void> = [];

function loadYTApi(cb: () => void) {
  if (ytApiLoaded) {
    cb();
    return;
  }
  ytApiCallbacks.push(cb);
  if (document.getElementById('yt-api-script')) return;
  const script = document.createElement('script');
  script.id = 'yt-api-script';
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
  window.onYouTubeIframeAPIReady = () => {
    ytApiLoaded = true;
    ytApiCallbacks.forEach((fn) => fn());
    ytApiCallbacks = [];
  };
}

export default function PlayingMode({ song, queueState, onEnded }: Props) {
  const playerRef = useRef<YTPlayer | null>(null);
  const currentVideoId = useRef<string>('');

  useEffect(() => {
    loadYTApi(() => {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('yt-player', {
          videoId: song.youtubeId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            controls: 0,
            fs: 0,
            iv_load_policy: 3,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                onEnded();
              }
            },
          },
        });
        currentVideoId.current = song.youtubeId;
      } else if (currentVideoId.current !== song.youtubeId) {
        playerRef.current.loadVideoById(song.youtubeId);
        currentVideoId.current = song.youtubeId;
      }
    });

    return () => {
      // Don't destroy on re-render — only when component unmounts
    };
  }, [song.youtubeId]);

  // Handle pause/resume from controller
  useEffect(() => {
    if (!playerRef.current) return;
    if (queueState.isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [queueState.isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        currentVideoId.current = '';
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <div id="yt-player" style={styles.player} />
      <div style={styles.overlay}>
        <div style={styles.songInfo}>
          <div style={styles.songTitle}>{song.title}</div>
          <div style={styles.songArtist}>{song.artist}</div>
        </div>
        {queueState.queue.length > 0 && (
          <div style={styles.queueBadge}>
            {queueState.queue.length} in queue
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: '#000',
    position: 'relative',
  },
  player: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '24px 32px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    pointerEvents: 'none',
  },
  songInfo: {
    maxWidth: '70%',
  },
  songTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'system-ui, sans-serif',
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
    marginBottom: 4,
  },
  songArtist: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    fontFamily: 'system-ui, sans-serif',
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
  },
  queueBadge: {
    background: 'rgba(220, 50, 50, 0.85)',
    color: '#fff',
    fontSize: 13,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 20,
  },
};
