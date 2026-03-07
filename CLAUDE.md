# Karaoke Project

## GitHub
- Repo: https://github.com/ct-coldboot/karaoke
- Owner: ct-coldboot

## Dev Setup
```bash
npm install       # from root — installs all workspaces
npm run dev       # starts server:3001, monitor:5173, controller:5174
```

## Architecture
- npm workspaces monorepo: `shared`, `server`, `monitor`, `controller`
- **Server**: Express + Socket.io on port 3001
- **Monitor**: Vite + React on port 5173 — full-screen YouTube IFrame display
- **Controller**: Vite + React on port 5174 — mobile-style dark UI for phone

## Prerequisites
- Node.js 18+
- `yt-dlp` on PATH (`pip install yt-dlp` or `winget install yt-dlp`)
- Chrome signed into Google on the monitor browser (for YouTube Premium)

## Key Files
- `shared/src/types.ts` — Song, QueueState, SearchResult interfaces
- `shared/src/events.ts` — Socket.io event name constants
- `server/src/queue.ts` — in-memory state machine + Socket.io broadcast
- `server/src/youtube.ts` — yt-dlp search with 5-min cache
- `monitor/src/App.tsx` — idle / transition / playing state machine
- `controller/src/App.tsx` — bottom nav shell (Home / Search / Queue)

## Notes
- Server tsconfig has no `rootDir` (avoids conflict with shared package imports)
- Vite configs alias `@karaoke/shared` → `../shared/src/index.ts`
- YouTube IFrame uses `youtube.com` (not nocookie) so browser Google session applies
- Transition timer is 4 seconds, managed server-side
- Monitor keeps PlayingMode mounted during transition so next video pre-loads
