import React, { useEffect, useRef, useState } from 'react';
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
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
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
  const playerReadyRef = useRef<boolean>(false);
  const currentVideoId = useRef<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  // Ref so the YT onError callback always has the latest song.youtubeId without stale closure
  const fetchStreamRef = useRef<() => void>(() => {});
  fetchStreamRef.current = () => {
    setStreamUrl(`/api/stream/${song.youtubeId}/proxy`);
  };

  // Reset to YT player when song changes
  useEffect(() => {
    setStreamUrl(null);
  }, [song.youtubeId]);

  // Destroy YT player when switching to native video
  useEffect(() => {
    if (!streamUrl) return;
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
      playerReadyRef.current = false;
      currentVideoId.current = '';
    }
  }, [streamUrl]);

  // YT IFrame player (used when streamUrl is null)
  useEffect(() => {
    if (streamUrl) return;
    loadYTApi(() => {
      if (!playerRef.current) {
        playerReadyRef.current = false;
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
            onReady: () => {
              playerReadyRef.current = true;
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                onEnded();
              }
            },
            onError: (event) => {
              // 101 / 150 = embedding disabled by video owner — fall back to direct stream
              if (event.data === 101 || event.data === 150) {
                fetchStreamRef.current();
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
    return () => {};
  }, [song.youtubeId, streamUrl]);

  // Pause/resume for YT player
  useEffect(() => {
    if (streamUrl || !playerRef.current || !playerReadyRef.current) return;
    if (queueState.isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [queueState.isPlaying, streamUrl]);

  // Pause/resume for native video
  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;
    if (queueState.isPlaying) {
      void videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [queueState.isPlaying, streamUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        playerReadyRef.current = false;
        currentVideoId.current = '';
      }
    };
  }, []);

  const hasQueue = queueState.queue.length > 0;
  const RIBBON_H = 56;

  return (
    <div style={styles.container}>
      {/* Always keep yt-player div mounted — YT IFrame API replaces it with an iframe
          directly in the DOM, so unmounting it causes a React/DOM mismatch crash */}
      <div id="yt-player" style={{ ...styles.player, display: streamUrl ? 'none' : 'block' }} />

      {streamUrl && (
        <video
          ref={videoRef}
          src={streamUrl}
          style={styles.player}
          autoPlay
          playsInline
          onEnded={onEnded}
        />
      )}

      {/* Now-playing overlay, sits above ribbon when queue is visible */}
      <div style={{ ...styles.overlay, bottom: hasQueue ? RIBBON_H : 0 }}>
        <div style={styles.songInfo}>
          <div style={styles.songTitle}>{song.title}</div>
          <div style={styles.songArtist}>{song.artist}</div>
        </div>
      </div>

      {/* Queue ribbon — 3-cell strip */}
      {hasQueue && (
        <div style={{ ...styles.ribbon, height: RIBBON_H }}>
          {[0, 1, 2].map((i) => {
            const queued = queueState.queue[i];
            return (
              <div
                key={i}
                style={{
                  ...styles.ribbonCell,
                  borderLeft: i > 0 ? '1px solid #333' : 'none',
                  opacity: queued ? 1 : 0.2,
                }}
              >
                {queued && (
                  <>
                    <span style={styles.ribbonNum}>{i + 1}</span>
                    <span style={styles.ribbonTitleGroup}>
                      {queued.queuedBy && (
                        <span style={styles.ribbonName}>{queued.queuedBy}</span>
                      )}
                      <span style={styles.ribbonTitle}>{queued.title}</span>
                    </span>
                    <span style={styles.ribbonArtist}>{queued.artist}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  ribbon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    background: '#1a1a1a',
    borderTop: '1px solid #333',
  },
  ribbonCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 14px',
    overflow: 'hidden',
    minWidth: 0,
  },
  ribbonNum: {
    color: '#e60026',
    fontSize: 18,
    fontWeight: 900,
    fontFamily: 'system-ui, sans-serif',
    flexShrink: 0,
    width: 20,
    textAlign: 'center',
  },
  ribbonTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  ribbonName: {
    color: '#ffe600',
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ribbonTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ribbonArtist: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 0,
    maxWidth: '35%',
  },
};
