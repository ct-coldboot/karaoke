# Big Inu Karaoke

A self-hosted home karaoke system. Search on your phone, play on your monitor — no app installs needed.

## How It Works

- **Controller** (`localhost:5174`) — open on your phone (scan the QR code on the idle screen). Search for songs, manage the queue, enter your name, skip/pause.
- **Monitor** (`localhost:5173`) — open in Chrome on the screen connected to your TV. Plays YouTube videos full-screen, auto-advances through the queue.

```
Phone (controller) ──┐
                      ├── WebSocket ── Server ── YouTube IFrame ── Monitor (TV)
Laptop (controller) ─┘
```

## Features

- YouTube search via `yt-dlp` with language filter tabs (All / English / 日本語)
- Real-time queue sync across all devices via Socket.io
- Auto-advance: songs play back-to-back automatically
- J-karaoke idle screen: animated background, Spotify idle music, periodic voice announcements
- QR code on idle screen — scan to open the controller on any phone
- Transition screen between songs with Japanese voice announcement
- Singer name: optionally enter your name on the controller, shown on the queue ribbon
- Skip, pause, resume from the controller
- YouTube Premium support — sign into Google in the monitor browser
- Embed-restricted videos fall back to direct `yt-dlp` stream automatically

## Chromecast Support

Tab-casting from Chrome works. The monitor runs on `localhost:5173` — cast that tab. Set:

```
VITE_TTS_PROVIDER=google
```

in `monitor/.env` to use Google Translate TTS (routed through the server), which is captured by the cast stream. The default `native` uses `window.speechSynthesis` which is not.

## Spotify Idle Music (optional)

Plays a Spotify playlist while the queue is empty. Pauses when a song starts, resumes on idle.

One-time setup:
```bash
npm run spotify-auth   # follow prompts, copy SPOTIFY_REFRESH_TOKEN into server/.env
```

Required env vars in `server/.env`:
```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=
SPOTIFY_REFRESH_TOKEN=
```

Optional in `monitor/.env`:
```
VITE_SPOTIFY_PLAYLIST_URI=spotify:playlist:...   # defaults to a J-pop playlist
```

## Requirements

- **Node.js** 18+
- **npm** 11+
- **yt-dlp** — used for YouTube search
  ```bash
  pip install yt-dlp
  # or
  winget install yt-dlp
  ```
- **Chrome** signed into Google on the monitor (for YouTube Premium / ad-free playback)

## Setup

```bash
git clone https://github.com/ct-coldboot/karaoke.git
cd karaoke
npm install
npm run dev
```

Then:
1. Open `http://localhost:5173` in Chrome on the monitor
2. Open `http://localhost:5174` on your phone (or scan the QR code on the idle screen)
3. Search for a song, tap **+** — it starts playing on the monitor

## Project Structure

```
karaoke/
├── shared/          # Shared TypeScript types and Socket.io event constants
├── server/          # Express + Socket.io backend (port 3001)
│   └── src/
│       ├── index.ts     # Server entry point
│       ├── queue.ts     # In-memory queue state machine
│       ├── youtube.ts   # yt-dlp search with 5-min cache
│       ├── spotify.ts   # Spotify token refresh
│       └── routes.ts    # /api/search, /api/stream, /api/spotify/token, /api/info, /api/tts
├── monitor/         # Full-screen display app (port 5173)
│   └── src/
│       ├── App.tsx                  # idle → transition → playing state machine
│       ├── components/
│       │   ├── IdleMode.tsx             # Ambient screen: logo, particles, QR code
│       │   ├── TransitionScreen.tsx     # "Up Next" splash with Japanese announcement
│       │   ├── PlayingMode.tsx          # YouTube IFrame + yt-dlp fallback, queue ribbon
│       │   └── BigInuLogo.tsx           # SVG logo component
│       ├── hooks/
│       │   ├── useSpotifyPlayer.ts      # Spotify Web Playback SDK singleton
│       │   └── useAnnouncements.ts      # Periodic idle voice announcements
│       └── utils/
│           └── tts.ts                   # TTS abstraction (native / google)
└── controller/      # Mobile controller app (port 5174)
    └── src/
        ├── App.tsx              # Bottom nav shell, name persistence
        └── screens/
            ├── HomeScreen.tsx       # Status overview + singer name input
            ├── SearchScreen.tsx     # Search with language tabs
            └── QueueScreen.tsx      # Queue management
```

## Queue State Machine

```
idle ──(song added)──▶ transition ──(4s)──▶ playing
                                               │
                              ┌────────────────┤ song ended / skip
                              ▼                │
                         transition ◀──────────┘  (if queue non-empty)
                              │
                              ▼ (if queue empty)
                            idle
```

## TTS Providers

Controlled by `VITE_TTS_PROVIDER` in `monitor/.env`:

| Value | Description |
|---|---|
| `native` (default) | `window.speechSynthesis` — works when monitor runs directly in Chrome |
| `google` | Google Translate TTS proxied through the server — works with Chromecast tab casting |

ElevenLabs support is planned as a future provider.

## Phase 3 Ideas

- **ElevenLabs TTS** — higher quality voice announcements
- **Spotify Recommendations** — suggested songs seeded from current track
- **Song history** (SQLite)
- **Multiple rooms** — different queues on different screens
