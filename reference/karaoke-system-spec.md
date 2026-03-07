# Home Karaoke System — Project Specification

## Vision

Recreate the Japanese karaoke box experience (specifically Big Echo / DAM system) at home using a Raspberry Pi (or Windows laptop as fallback), a monitor, speakers, and a phone as the controller. The system should feel like a dedicated karaoke appliance, not a cobbled-together hack.

### Reference: DAM / Big Echo Karaoke

The target experience is modeled after the **DAM (Daiichi Kosho)** karaoke system used at **Big Echo** karaoke rooms in Japan. Key characteristics:

- **Tablet controller** ("Smart DAM Ai"): A dedicated touch device for searching songs by keyword, title, artist name, genre, or browsing history/rankings. Song results show title, artist, and feature badges (official MV, live karaoke, etc.). Songs are queued by tapping.
- **Main screen**: Displays karaoke videos with lyrics overlaid (color-highlighted as the singer progresses). Between songs, branded splash screens and music videos play.
- **Song catalog**: Each song has a unique selection number (選曲番号). Search supports partial matching and multiple languages.
- **Room atmosphere**: The screen is always active — either showing a song, a transition/splash, or ambient music video content. It never goes dark or shows a desktop.

---

## System Architecture

### Three Components

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   Phone App     │ ◄────────────────► │   Backend       │
│   (Controller)  │     HTTP/WS        │   (Node.js)     │
│   Browser-based │                    │   on Pi/Laptop  │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │ WebSocket
                                                │
                                       ┌────────▼────────┐
                                       │   Monitor App   │
                                       │   (Stage View)  │
                                       │   Browser-based │
                                       │   Full-screen   │
                                       └─────────────────┘
```

1. **Backend Server** (Node.js/TypeScript) — runs on the Pi or laptop
   - Serves both the phone UI and the monitor UI
   - Manages song queue, playback state, and history
   - Handles YouTube search and video URL resolution
   - Bridges communication between phone and monitor via WebSocket

2. **Monitor App** (browser, full-screen) — the "stage"
   - Displays on the HDMI-connected monitor
   - Three modes: **Idle**, **Transition**, **Playing**
   - Always shows something — never a blank screen or desktop

3. **Phone App** (browser, mobile-optimized) — the "controller"
   - Accessed by navigating to the Pi/laptop's local IP in the phone browser
   - Search, browse, queue songs, control playback

All communication is local network only. The only external dependency is YouTube for video content.

---

## Monitor App — Screen States

### State 1: Idle Mode
**When**: No songs are queued and nothing is playing.

- Plays a curated playlist of music videos from YouTube (user-configurable playlist)
- Videos play one after another, cycling through the playlist
- A subtle overlay in the corner shows the system name/logo (customizable)
- The aesthetic should feel like the ambient content playing in a karaoke room between sessions
- If the user queues a song while idle, transition to the next state

### State 2: Transition / Splash Screen
**When**: Between songs, or when a song is first queued from idle.

- Shows a branded splash screen inspired by the Big Echo "information" screen
- Displays: system logo/name, "Up Next" with the song title and artist
- Duration: ~3-5 seconds (enough to build anticipation, not so long it's annoying)
- Background: a styled gradient or subtle animation — not just a static card
- This is a key part of making it feel "real" — DAM systems have polished transitions

### State 3: Playing
**When**: A karaoke video is actively playing.

- The YouTube karaoke video plays full-screen (embedded or via yt-dlp stream)
- A small, semi-transparent overlay at the bottom or top shows:
  - Current song title and artist
  - Queue count (e.g., "2 more songs in queue")
- The overlay should be unobtrusive — the video is the star
- When the video ends, auto-advance to the next queued song (via transition screen) or return to idle

### State Transitions
```
Idle ──[song queued]──► Transition ──[3-5s]──► Playing
Playing ──[song ends, queue not empty]──► Transition ──► Playing
Playing ──[song ends, queue empty]──► Idle
Playing ──[skip pressed]──► Transition ──► Playing (or Idle if queue empty)
```

---

## Phone App — Screens & UX

### Design Philosophy
Inspired by the DAM Smart DAM Ai tablet, but simplified for a phone screen. The DAM tablet is dense with options — the phone app should capture the core flows with a cleaner, more modern mobile UI. Think: the functionality of the DAM tablet, the aesthetics of a modern mobile app.

### Screen: Home
- Search bar at the top (prominent, always visible)
- Quick-access sections below:
  - **Recently Played** (last ~20 songs)
  - **Favorites** (songs the user has hearted)
- Bottom navigation: Home | Search | Queue | Settings

### Screen: Search
- Full-screen search with tabs: **Song Title** | **Artist**
- As the user types, results appear below (YouTube search filtered for karaoke versions)
- Each result shows:
  - Song title
  - Artist name
  - Duration
  - Thumbnail (small)
  - "Add to Queue" button (prominent)
  - "Favorite" heart icon
- Tapping a result adds it to the queue and shows a brief confirmation toast
- Search should append "karaoke" to queries automatically when searching YouTube

### Screen: Queue
- Shows the current queue as an ordered list
- Currently playing song highlighted at the top with a "Now Playing" indicator
- Each queued song shows title, artist, and a remove button
- Drag-to-reorder capability
- "Clear Queue" option
- If queue is empty, friendly message: "Search for a song to get started!"

### Screen: Now Playing (optional overlay / mini-player)
- Small bar at the bottom of all screens showing what's currently playing
- Song title, artist, and basic controls: Skip | Pause/Resume
- Tapping expands to a full "Now Playing" view with:
  - Larger display of current song info
  - Skip, Pause/Resume, Volume Up/Down
  - Queue preview (next 2-3 songs)

### Screen: Settings
- **Idle Playlist**: Set/change the YouTube playlist URL for idle mode music videos
- **Splash Screen**: Customize the name/logo shown on the transition screen
- **Search Preferences**: Toggle whether to auto-append "karaoke" to searches
- **Display**: Adjust overlay opacity, font size for the monitor
- **System**: Show the monitor URL (for setup), network info

---

## Technical Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **HTTP Framework**: Express or Fastify
- **WebSocket**: ws or socket.io (for real-time sync between phone and monitor)
- **YouTube Integration**: yt-dlp (via child process) for searching and resolving video URLs
- **Data Storage**: SQLite (via better-sqlite3) for favorites, history, settings
- **Process Manager**: PM2 (for auto-start on Pi boot)

### Monitor App (Frontend)
- **Framework**: React (single-page app)
- **Video Playback**: YouTube IFrame Player API (preferred for simplicity) or direct stream via yt-dlp
- **Styling**: Tailwind CSS
- **Animations**: CSS transitions/animations for splash screens, Framer Motion if needed
- **Full-screen**: Launched in kiosk mode (Chromium `--kiosk` flag on Pi)

### Phone App (Frontend)
- **Framework**: React (mobile-optimized SPA)
- **Styling**: Tailwind CSS with mobile-first design
- **Communication**: WebSocket client for real-time queue/state updates
- **UX**: Touch-optimized, large tap targets, swipe gestures for queue management

### Key Libraries
- `yt-dlp` — YouTube video search and URL resolution
- `socket.io` — WebSocket communication
- `better-sqlite3` — Local database for history/favorites/settings
- `express` — HTTP server
- YouTube IFrame Player API — Video embedding on monitor

---

## YouTube Integration Details

### Searching for Songs
- Use yt-dlp's search functionality: `yt-dlp "ytsearch10:{query} karaoke" --dump-json`
- Parse results for title, channel, duration, thumbnail, video ID
- Filter results to prefer channels known for quality karaoke content
- Cache search results briefly to avoid redundant lookups

### Playing Videos
- **Option A (Recommended for simplicity)**: Use the YouTube IFrame Player API on the monitor
  - Embed the video using the YouTube player
  - Control playback via the API (play, pause, skip, volume)
  - Pros: Simple, reliable, handles adaptive streaming
  - Cons: Requires internet, may show YouTube UI briefly

- **Option B (For more control)**: Use yt-dlp to extract the stream URL, play via a custom video player
  - More control over the display, no YouTube branding
  - More complex, stream URLs expire, need to handle re-resolution
  - Better for a polished, branded feel

**Recommendation**: Start with Option A (YouTube IFrame API) for the MVP. Move to Option B later if the YouTube UI elements are too distracting.

### Idle Playlist
- User provides a YouTube playlist URL in settings
- Backend resolves the playlist to a list of video IDs
- Monitor shuffles through them during idle mode
- If no playlist is configured, show the splash/logo screen as a static idle

---

## Data Model

### Song (in queue / history / favorites)
```typescript
interface Song {
  id: string;            // Internal UUID
  youtubeId: string;     // YouTube video ID
  title: string;         // Song title (cleaned up from YouTube title)
  artist: string;        // Artist name (parsed from title or metadata)
  duration: number;      // Duration in seconds
  thumbnail: string;     // Thumbnail URL
  addedAt: Date;         // When it was added to queue
}
```

### Queue State (in memory, synced via WebSocket)
```typescript
interface QueueState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  mode: 'idle' | 'transition' | 'playing';
}
```

### Favorites & History (persisted in SQLite)
```typescript
interface FavoriteRecord {
  youtubeId: string;
  title: string;
  artist: string;
  thumbnail: string;
  favoritedAt: Date;
}

interface HistoryRecord {
  youtubeId: string;
  title: string;
  artist: string;
  playedAt: Date;
}
```

---

## Hardware Setup

### Minimum (MVP)
- **Compute**: Raspberry Pi 4 (4GB+) or any laptop/desktop
- **Display**: Any monitor with HDMI input
- **Audio**: Monitor speakers (or external speakers connected to Pi's 3.5mm or via HDMI audio)
- **Network**: WiFi (Pi and phone on the same network)
- **Microphone**: Not required for MVP (singing is acoustic, just like many home karaoke setups)

### Recommended (Full Experience)
- **Compute**: Raspberry Pi 5 (for smoother video playback)
- **Display**: Large monitor or TV (32"+ for that karaoke room feel)
- **Audio**: External powered speakers or a soundbar connected via HDMI/Bluetooth
- **Microphone**: USB microphone + mixer if you want amplified vocals (Phase 2)
- **Case**: A nice enclosure for the Pi to keep it clean

### Windows Laptop Fallback
- Run the Node.js server directly on the laptop
- Connect laptop to monitor via HDMI (extended display or mirror)
- Open the monitor app in Chrome full-screen on the external display
- Open the phone app on your phone's browser
- Everything else works the same

---

## Build Phases

### Phase 1: Core MVP
**Goal**: Search a song on your phone, have it play on the monitor, with a basic queue.

- [ ] Backend server with Express + Socket.io
- [ ] YouTube search via yt-dlp
- [ ] Phone app: search screen + queue screen (basic)
- [ ] Monitor app: YouTube video playback in full-screen
- [ ] WebSocket sync between phone and monitor
- [ ] Basic queue management (add, remove, skip, auto-advance)

**Deliverable**: You can search for a karaoke song on your phone, tap it, and it plays on the monitor.

### Phase 2: The Karaoke Box Feel
**Goal**: Make it feel like Big Echo, not a prototype.

- [ ] Transition/splash screen between songs (Big Echo style)
- [ ] Idle mode with music video playlist
- [ ] Now Playing overlay on the monitor
- [ ] Now Playing mini-player bar on the phone
- [ ] Favorites and history (persisted)
- [ ] Polished phone UI with proper navigation and animations

**Deliverable**: The full karaoke box experience — idle videos, branded transitions, smooth flow.

### Phase 3: Polish & Extras
**Goal**: Quality of life and advanced features.

- [ ] Drag-to-reorder queue on phone
- [ ] Settings screen (idle playlist, splash customization, display options)
- [ ] Improved search with smart "karaoke" filtering and result ranking
- [ ] Pi auto-start on boot (kiosk mode + PM2)
- [ ] Volume control from phone
- [ ] Song title/artist parsing improvements (strip "karaoke version", "instrumental", etc. from YouTube titles)

### Phase 4: Future Ideas (Optional)
- Microphone input with mixing/echo effects
- Scoring system (pitch detection)
- Multi-room support
- Song request via QR code for guests
- Bluetooth speaker integration
- Custom karaoke video generation from audio + lyrics

---

## Development Notes for Claude Code

### Getting Started
1. Initialize a new Node.js project with TypeScript
2. Set up a monorepo or simple multi-folder structure:
   ```
   karaoke/
   ├── server/          # Node.js backend
   ├── monitor/         # React app for the big screen
   ├── controller/      # React app for the phone
   ├── shared/          # Shared types and constants
   └── package.json
   ```
3. Start with Phase 1 — get the basic search-to-playback loop working
4. Use yt-dlp (must be installed on the system) for YouTube interaction
5. Use Socket.io for the WebSocket layer (simpler than raw ws for this use case)

### Key Technical Decisions
- **Monorepo**: Keep server, monitor, and controller in one repo for easy development
- **Shared types**: TypeScript interfaces shared between all three packages
- **YouTube IFrame API first**: Don't over-engineer video playback in Phase 1
- **SQLite**: Simple, no external database server needed, perfect for Pi
- **Mobile-first CSS**: The controller app is phone-only, design accordingly

### Testing the System
- During development, run the server on your laptop
- Open `localhost:3000/monitor` in a Chrome window (simulate the big screen)
- Open `localhost:3000/controller` on your phone (or in Chrome DevTools mobile view)
- Both should stay in sync via WebSocket

### Pi Deployment
- Install Node.js on the Pi
- Install yt-dlp on the Pi
- Set up Chromium to auto-launch in kiosk mode pointing to localhost
- Use PM2 to keep the Node.js server running
- Configure the Pi to auto-connect to WiFi on boot

---

## UI/UX Reference Notes

### Phone Controller — Inspired by Smart DAM Ai
- The real DAM tablet has tabs for: keyword search, song title, artist name, lyrics, genre, history, rankings, foreign languages
- For our phone app, simplify to: Search (with title/artist toggle), Favorites, History, Queue
- Color scheme: Dark theme preferred (matches the karaoke room vibe), with accent colors for interactive elements
- The DAM search results show songs in a list with clear song title + artist pairing — replicate this clean list layout
- The "MY list" save button on DAM = our "Favorite" heart button

### Monitor — Inspired by Big Echo Room
- The Big Echo splash screen uses their red branding with white text on a clean background
- For our system, create a customizable splash that feels similarly polished
- The transition screen should feel like a brief, intentional pause — not a loading screen
- During playback, the overlay should be minimal — don't distract from the karaoke video
- During idle, the music videos should feel ambient and fun, like background entertainment in a karaoke room
