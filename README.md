# Karaoke Home

A self-hosted home karaoke system. Search on your phone, play on your monitor — no app installs needed.

Inspired by the DAM/Big Echo karaoke experience.

## How It Works

- **Controller** (`localhost:5174`) — open on your phone (or browser DevTools mobile view). Search for songs, manage the queue, skip/pause.
- **Monitor** (`localhost:5173`) — open in Chrome on the screen connected to your TV/monitor. Plays YouTube videos full-screen, auto-advances through the queue.

```
Phone (controller) ──┐
                      ├── WebSocket ── Server ── YouTube IFrame ── Monitor (TV)
Laptop (controller) ─┘
```

## Features

- YouTube search via `yt-dlp` with language filter tabs (All / English / 日本語)
- Real-time queue sync across all devices via Socket.io
- Auto-advance: songs play back-to-back automatically
- Transition screen between songs (Big Echo-style "Up Next" splash)
- Skip, pause, resume from the controller
- YouTube Premium support — just sign into Google in the monitor browser

## Requirements

- **Node.js** 18+
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
1. Open `http://localhost:5173` in Chrome on the monitor — click "Click to Activate"
2. Open `http://localhost:5174` in your phone browser (or DevTools mobile view)
3. Search for a song, tap **+** — it will start playing on the monitor

## Project Structure

```
karaoke/
├── shared/          # Shared TypeScript types and Socket.io event constants
├── server/          # Express + Socket.io backend (port 3001)
│   └── src/
│       ├── index.ts     # Server entry point
│       ├── queue.ts     # In-memory queue + state machine
│       ├── youtube.ts   # yt-dlp search with caching
│       └── routes.ts    # GET /api/search
├── monitor/         # Full-screen display app (port 5173)
│   └── src/
│       ├── App.tsx              # idle → transition → playing state machine
│       └── components/
│           ├── IdleMode.tsx         # Ambient branded screen
│           ├── TransitionScreen.tsx # "Up Next" splash between songs
│           └── PlayingMode.tsx      # YouTube IFrame player
└── controller/      # Mobile controller app (port 5174)
    └── src/
        ├── App.tsx              # Bottom nav shell
        ├── screens/
        │   ├── HomeScreen.tsx       # Overview + quick search
        │   ├── SearchScreen.tsx     # Search with language tabs + results
        │   └── QueueScreen.tsx      # Queue management
        └── components/
            ├── SongCard.tsx         # Search result card with [+] button
            ├── NowPlayingBar.tsx    # Sticky mini-player (skip/pause/resume)
            └── BottomNav.tsx        # Tab navigation
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

## Production (Raspberry Pi)

Build the React apps and serve them as static files from the server:

```bash
npm run build
node server/dist/index.js
```

The server serves monitor at `/monitor` and controller at `/controller`.

## Phase 2 Ideas

- **Suggested songs** — Spotify Recommendations API seeded from the current song
- **Recently played** history (SQLite)
- **Idle playlist** — ambient YouTube playlist when no songs are queued
- **Multiple rooms** — different queues on different screens
