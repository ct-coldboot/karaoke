# Gaudy UX Redesign + Spotify Idle Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the controller and monitor with a loud J-karaoke aesthetic (hot pink / cyan / yellow on dark), add the Big Echo logo to the idle screen, and play Spotify music with periodic voice announcements during idle.

**Architecture:** Spotify Web Playback SDK runs in the monitor browser, fetching access tokens from a server endpoint that uses a stored refresh token. Announcements use the browser's Web Speech API on a timer. Visual redesign touches all controller screens and monitor components using a shared color palette.

**Tech Stack:** Spotify Web Playback SDK, Web Speech API, React inline styles (existing pattern), TypeScript, Express.

---

## Color Palette (reference for all tasks)

```ts
// Use these values throughout — no separate theme file needed
const BG        = '#0a0014'   // deep purple-black
const CARD      = 'rgba(255,255,255,0.08)'
const BORDER    = 'rgba(255,255,255,0.13)'
const PINK      = '#ff0066'   // hot pink primary
const CYAN      = '#00eeff'   // cyan secondary
const YELLOW    = '#ffe600'   // yellow accent
const RED       = '#cc0000'   // Big Echo red
const WHITE     = '#ffffff'
const MUTED     = 'rgba(255,255,255,0.55)'

// Button gradients
const BTN_PINK   = 'linear-gradient(135deg, #ff0066, #cc0099)'
const BTN_CYAN   = 'linear-gradient(135deg, #00eeff, #0088ff)'
const BTN_YELLOW = 'linear-gradient(135deg, #ffe600, #ff8800)'
const BTN_GREEN  = 'linear-gradient(135deg, #00ff99, #00cc55)'
```

---

## Pre-scripted Announcements (reference for Task 5)

```ts
const ANNOUNCEMENTS = [
  // Japanese
  { text: 'ご来店ありがとうございます！ビッグエコーへようこそ！', lang: 'ja-JP' },
  { text: '只今、お客様のために最高のカラオケをご用意しております！', lang: 'ja-JP' },
  { text: '歌いたい曲は、コントローラーから検索できます！どうぞお楽しみください！', lang: 'ja-JP' },
  { text: 'ビッグエコーでは、毎日が歌のお祭りです！皆様、思う存分歌いましょう！', lang: 'ja-JP' },
  { text: 'お待たせしました！まもなく素晴らしい曲をお届けします！', lang: 'ja-JP' },
  // "Bad English" — use ja-JP voice so it naturally sounds accented
  { text: 'Thank you so much for coming Big Echo tonight! Please enjoy your karaoke very much!', lang: 'ja-JP' },
  { text: 'We have many many songs for you! Please use controller to find your favorite song!', lang: 'ja-JP' },
  { text: 'Big Echo is number one karaoke entertainment in the world! Please sing everyone together!', lang: 'ja-JP' },
  { text: 'Tonight is very special karaoke night! Please enjoy and have wonderful time!', lang: 'ja-JP' },
  { text: 'If you want to sing song, please search from controller! Thank you very much!', lang: 'ja-JP' },
];
```

---

## Task 1: Spotify One-Time Auth Helper Script

**Goal:** Produce a `SPOTIFY_REFRESH_TOKEN` the user saves as an env var. Run once ever.

**Files:**
- Create: `scripts/spotify-auth.ts`
- Modify: `package.json` (add script)

**Step 1: Install ts-node for running the script**

```bash
npm install --save-dev ts-node
```

**Step 2: Create the helper script**

Create `scripts/spotify-auth.ts`:

```ts
import * as readline from 'readline';
import * as https from 'https';
import * as url from 'url';

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.SPOTIFY_REDIRECT_URI!;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error('Missing env vars: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI');
  process.exit(1);
}

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

const authUrl =
  `https://accounts.spotify.com/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}`;

console.log('\n=== Spotify One-Time Auth ===\n');
console.log('1. Open this URL in your browser:\n');
console.log('   ' + authUrl);
console.log('\n2. Authorize the app.');
console.log('3. The browser will redirect to a URL that fails to load — that is expected.');
console.log('4. Copy the FULL URL from the address bar and paste it below.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste the redirect URL here: ', async (redirectUrl) => {
  rl.close();
  const parsed = new url.URL(redirectUrl);
  const code = parsed.searchParams.get('code');
  if (!code) {
    console.error('No code found in URL. Did you paste the full redirect URL?');
    process.exit(1);
  }

  const body = new URLSearchParams({
    grant_type:   'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  }).toString();

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const options: https.RequestOptions = {
    hostname: 'accounts.spotify.com',
    path:     '/api/token',
    method:   'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      const json = JSON.parse(data) as Record<string, unknown>;
      if (json.error) {
        console.error('Token exchange failed:', json);
        process.exit(1);
      }
      console.log('\n=== SUCCESS ===\n');
      console.log('Add this to your user environment variables:\n');
      console.log(`SPOTIFY_REFRESH_TOKEN=${json.refresh_token}`);
      console.log('\nThen restart your terminal and run: npm run dev\n');
    });
  });

  req.on('error', (err) => { console.error(err); process.exit(1); });
  req.write(body);
  req.end();
});
```

**Step 3: Add script to package.json**

In the root `package.json`, add to `"scripts"`:
```json
"spotify-auth": "ts-node scripts/spotify-auth.ts"
```

**Step 4: Test manually**

Ensure env vars are set, then:
```bash
npm run spotify-auth
```
Expected: prints an authorization URL, prompts for redirect URL, prints `SPOTIFY_REFRESH_TOKEN=...`

**Step 5: Commit**

```bash
git add scripts/spotify-auth.ts package.json
git commit -m "feat: add Spotify one-time auth helper script"
```

---

## Task 2: Spotify Server-Side Token Management

**Goal:** Server exchanges refresh token for access token, caches it, auto-refreshes.

**Files:**
- Create: `server/src/spotify.ts`

**Step 1: Create the module**

Create `server/src/spotify.ts`:

```ts
import * as https from 'https';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getSpotifyAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify env vars: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN');
  }

  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
  }).toString();

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'accounts.spotify.com',
      path:     '/api/token',
      method:   'POST',
      headers: {
        Authorization:  `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const json = JSON.parse(data) as Record<string, unknown>;
        if (json.error || !json.access_token) {
          return reject(new Error(`Spotify token refresh failed: ${JSON.stringify(json)}`));
        }
        cachedToken = json.access_token as string;
        tokenExpiresAt = Date.now() + (json.expires_in as number) * 1000;
        // Spotify may rotate the refresh token
        if (json.refresh_token) {
          process.env.SPOTIFY_REFRESH_TOKEN = json.refresh_token as string;
        }
        resolve(cachedToken);
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
```

**Step 2: Verify it compiles**

```bash
cd server && npx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**

```bash
git add server/src/spotify.ts
git commit -m "feat: Spotify server-side token refresh module"
```

---

## Task 3: Spotify Token API Endpoint

**Goal:** Expose `GET /api/spotify/token` so the monitor browser can fetch an access token.

**Files:**
- Modify: `server/src/routes.ts`

**Step 1: Add the endpoint**

At the top of `server/src/routes.ts`, add the import:
```ts
import { getSpotifyAccessToken } from './spotify';
```

After the existing routes, before `export default router`, add:
```ts
router.get('/spotify/token', async (_req: Request, res: Response) => {
  try {
    const token = await getSpotifyAccessToken();
    res.json({ token });
  } catch (err) {
    console.error('Spotify token error:', err);
    res.status(503).json({ error: 'Spotify unavailable' });
  }
});
```

**Step 2: Start dev server and test**

```bash
npm run dev
```
Then in a browser or curl:
```
GET http://localhost:3001/api/spotify/token
```
Expected: `{"token":"BQA..."}` (if env vars set) or `{"error":"Spotify unavailable"}` (if not configured — that's fine for now)

**Step 3: Commit**

```bash
git add server/src/routes.ts
git commit -m "feat: expose GET /api/spotify/token endpoint"
```

---

## Task 4: Monitor — Spotify Web Playback SDK Hook

**Goal:** A React hook that initializes the Spotify SDK, registers a device, and plays a playlist.

**Files:**
- Create: `monitor/src/hooks/useSpotifyPlayer.ts`

**Step 1: Add Spotify SDK type declaration**

At the top of `monitor/src/hooks/useSpotifyPlayer.ts`, include a minimal type shim:

```ts
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
```

**Step 2: Create the hook**

```ts
import { useEffect, useRef } from 'react';

const PLAYLIST_URI = import.meta.env.VITE_SPOTIFY_PLAYLIST_URI as string | undefined;
const DEFAULT_PLAYLIST = 'spotify:playlist:37i9dQZF1DX9tPFwDMOaN1'; // J-Pop Hits

async function fetchToken(): Promise<string> {
  const res = await fetch('/api/spotify/token');
  if (!res.ok) throw new Error('Token fetch failed');
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
      context_uri: PLAYLIST_URI ?? DEFAULT_PLAYLIST,
      offset: { position: Math.floor(Math.random() * 20) },
    }),
  });
}

export function useSpotifyPlayer(active: boolean) {
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const deviceIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) {
      playerRef.current?.disconnect();
      playerRef.current = null;
      deviceIdRef.current = null;
      return;
    }

    let cancelled = false;

    async function init() {
      const token = await fetchToken().catch(() => null);
      if (!token || cancelled) return;

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

      window.onSpotifyWebPlaybackSDKReady = () => {
        if (cancelled) return;

        const player = new window.Spotify.Player({
          name: 'Big Echo Home Karaoke',
          getOAuthToken: async (cb) => {
            const t = await fetchToken().catch(() => '');
            cb(t);
          },
          volume: 0.4,
        });

        player.addListener('ready', async ({ device_id }) => {
          if (cancelled) return;
          deviceIdRef.current = device_id;
          const t = await fetchToken().catch(() => null);
          if (!t || cancelled) return;
          await transferPlayback(device_id, t);
          await startPlaylist(device_id, t);
        });

        player.addListener('not_ready', () => {
          deviceIdRef.current = null;
        });

        player.connect();
        playerRef.current = player;
      };

      // If SDK already loaded, fire the callback manually
      if (window.Spotify) {
        window.onSpotifyWebPlaybackSDKReady();
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
```

**Step 3: Add env var to monitor's Vite config**

In `monitor/vite.config.ts`, the `VITE_SPOTIFY_PLAYLIST_URI` env var will be automatically available via `import.meta.env`. No config change needed — the user just sets it optionally.

**Step 4: Verify no TypeScript errors**

```bash
cd monitor && npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add monitor/src/hooks/useSpotifyPlayer.ts
git commit -m "feat: Spotify Web Playback SDK hook for monitor idle screen"
```

---

## Task 5: Monitor — Announcements Hook

**Goal:** A hook that fires pre-scripted announcements via Web Speech API on a random interval during idle.

**Files:**
- Create: `monitor/src/hooks/useAnnouncements.ts`

**Step 1: Create the hook**

```ts
import { useEffect, useRef } from 'react';

const ANNOUNCEMENTS = [
  { text: 'ご来店ありがとうございます！ビッグエコーへようこそ！', lang: 'ja-JP' },
  { text: '只今、お客様のために最高のカラオケをご用意しております！', lang: 'ja-JP' },
  { text: '歌いたい曲は、コントローラーから検索できます！どうぞお楽しみください！', lang: 'ja-JP' },
  { text: 'ビッグエコーでは、毎日が歌のお祭りです！皆様、思う存分歌いましょう！', lang: 'ja-JP' },
  { text: 'お待たせしました！まもなく素晴らしい曲をお届けします！', lang: 'ja-JP' },
  { text: 'Thank you so much for coming Big Echo tonight! Please enjoy your karaoke very much!', lang: 'ja-JP' },
  { text: 'We have many many songs for you! Please use controller to find your favorite song!', lang: 'ja-JP' },
  { text: 'Big Echo is number one karaoke entertainment in the world! Please sing everyone together!', lang: 'ja-JP' },
  { text: 'Tonight is very special karaoke night! Please enjoy and have wonderful time!', lang: 'ja-JP' },
  { text: 'If you want to sing song, please search from controller! Thank you very much!', lang: 'ja-JP' },
];

const MIN_INTERVAL_MS = 3 * 60 * 1000;  // 3 minutes
const MAX_INTERVAL_MS = 5 * 60 * 1000;  // 5 minutes

function speak(text: string, lang: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

export function useAnnouncements(active: boolean) {
  const indexRef = useRef(Math.floor(Math.random() * ANNOUNCEMENTS.length));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.speechSynthesis?.cancel();
      return;
    }

    function scheduleNext() {
      const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
      timerRef.current = setTimeout(() => {
        const announcement = ANNOUNCEMENTS[indexRef.current % ANNOUNCEMENTS.length];
        indexRef.current++;
        speak(announcement.text, announcement.lang);
        scheduleNext();
      }, delay);
    }

    // First announcement after a short delay so music starts first
    timerRef.current = setTimeout(() => {
      const announcement = ANNOUNCEMENTS[indexRef.current % ANNOUNCEMENTS.length];
      indexRef.current++;
      speak(announcement.text, announcement.lang);
      scheduleNext();
    }, 30_000); // 30 seconds after idle starts

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [active]);
}
```

**Step 2: Verify no TypeScript errors**

```bash
cd monitor && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add monitor/src/hooks/useAnnouncements.ts
git commit -m "feat: Web Speech API announcements hook for idle screen"
```

---

## Task 6: Big Echo Logo SVG Component

**Goal:** Recreate the Big Echo logo as a React component — red background, white "BIG ECHO" text, yellow swoosh, "Karaoke Entertainment" subtitle.

**Files:**
- Create: `monitor/src/components/BigEchoLogo.tsx`

**Step 1: Create the component**

```tsx
import React from 'react';

interface Props {
  width?: number;
}

export default function BigEchoLogo({ width = 480 }: Props) {
  const h = Math.round(width * 0.42);
  return (
    <svg width={width} height={h} viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg">
      {/* Red background */}
      <rect x="0" y="0" width="480" height="200" rx="8" ry="8" fill="#cc0000" />

      {/* "Karaoke Entertainment" — small, centered, top */}
      <text
        x="240"
        y="52"
        textAnchor="middle"
        fill="white"
        fontFamily="'Arial', 'Helvetica Neue', sans-serif"
        fontWeight="300"
        fontSize="22"
        letterSpacing="3"
      >
        Karaoke Entertainment
      </text>

      {/* "BIG ECHO" — large, bold, centered */}
      <text
        x="240"
        y="138"
        textAnchor="middle"
        fill="white"
        fontFamily="'Arial Black', 'Arial', 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="88"
        letterSpacing="-1"
      >
        BIG ECHO
      </text>

      {/* Yellow swoosh arc below text */}
      <path
        d="M 60 158 Q 240 185 420 158"
        fill="none"
        stroke="#ffe600"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 80 166 Q 240 196 400 166"
        fill="none"
        stroke="#ffcc00"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
```

**Step 2: Verify visually** — import and render in the browser, compare to reference image `1772910982250_image.png`.

**Step 3: Commit**

```bash
git add monitor/src/components/BigEchoLogo.tsx
git commit -m "feat: Big Echo logo SVG component"
```

---

## Task 7: Monitor — Idle Screen Redesign

**Goal:** Replace the current IdleMode with a J-karaoke ambient screen: Big Echo logo, animated background, Spotify music, periodic announcements.

**Files:**
- Modify: `monitor/src/components/IdleMode.tsx`

**Step 1: Rewrite IdleMode**

```tsx
import React, { useEffect, useRef } from 'react';
import BigEchoLogo from './BigEchoLogo';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useAnnouncements } from '../hooks/useAnnouncements';

export default function IdleMode() {
  useSpotifyPlayer(true);
  useAnnouncements(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated starfield / particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      color: ['#ff0066', '#00eeff', '#ffe600', '#cc00ff', '#ffffff'][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let animId: number;

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={styles.container}>
      {/* Animated particle background */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Radial glow behind logo */}
      <div style={styles.glow} />

      {/* Big Echo logo */}
      <div style={styles.logoWrap}>
        <BigEchoLogo width={520} />
      </div>

      {/* Subtitle */}
      <div style={styles.subtitle}>
        ♪ &nbsp; Search for a song on your phone to get started &nbsp; ♪
      </div>

      {/* Corner decorations — colourful karaoke dots */}
      <div style={{ ...styles.corner, top: 24, left: 24 }}>
        {['#ff0066', '#00eeff', '#ffe600'].map((c, i) => (
          <div key={i} style={{ ...styles.dot, background: c }} />
        ))}
      </div>
      <div style={{ ...styles.corner, top: 24, right: 24, flexDirection: 'row-reverse' }}>
        {['#cc00ff', '#00eeff', '#ff0066'].map((c, i) => (
          <div key={i} style={{ ...styles.dot, background: c }} />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: '#0a0014',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  glow: {
    position: 'absolute',
    width: 700,
    height: 400,
    background: 'radial-gradient(ellipse, rgba(204,0,0,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logoWrap: {
    position: 'relative',
    zIndex: 1,
    filter: 'drop-shadow(0 0 40px rgba(204,0,0,0.6)) drop-shadow(0 4px 24px rgba(0,0,0,0.8))',
    animation: 'pulse 3s ease-in-out infinite',
  },
  subtitle: {
    marginTop: 40,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 20,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 2,
    position: 'relative',
    zIndex: 1,
  },
  corner: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    boxShadow: '0 0 8px currentColor',
  },
};
```

**Step 2: Add keyframe animation** — in `monitor/index.html`, add inside `<style>` in `<head>`:
```html
<style>
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
</style>
```

**Step 3: Verify visually** — run `npm run dev`, open monitor at `localhost:5173`, let it sit on idle mode. Verify: particles animate, logo renders, Spotify starts playing (if token configured), no console errors.

**Step 4: Commit**

```bash
git add monitor/src/components/IdleMode.tsx monitor/index.html
git commit -m "feat: J-karaoke idle screen with Big Echo logo, Spotify music, and announcements"
```

---

## Task 8: Monitor — Transition Screen Redesign

**Goal:** Apply J-karaoke color treatment to the transition/splash screen.

**Files:**
- Modify: `monitor/src/components/TransitionScreen.tsx`

**Step 1: Read the current file** to understand its structure before modifying.

**Step 2: Redesign**

Key changes:
- Background: `#0a0014` with animated gradient sweep (pink → cyan → purple)
- Song title: large white bold text with hot-pink text shadow
- Artist: cyan
- "UP NEXT" badge: hot-pink pill badge
- Decorative colorful bars/stripes at top and bottom
- Big Echo logo small in corner

Replace the styles object and layout with:

```tsx
import React, { useEffect, useState } from 'react';
import { Song } from '@karaoke/shared';
import BigEchoLogo from './BigEchoLogo';

interface Props { song: Song; }

export default function TransitionScreen({ song }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div style={styles.container}>
      {/* Animated gradient background */}
      <div style={styles.bg} />

      {/* Colorful top stripe */}
      <div style={styles.topStripe} />

      {/* Content */}
      <div style={{ ...styles.content, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.5s ease' }}>
        <div style={styles.badge}>▶ UP NEXT</div>
        <div style={styles.title}>{song.title}</div>
        <div style={styles.artist}>{song.artist}</div>
      </div>

      {/* Bottom stripe */}
      <div style={styles.bottomStripe} />

      {/* Big Echo logo watermark */}
      <div style={styles.watermark}>
        <BigEchoLogo width={160} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: '#0a0014',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(255,0,102,0.15) 0%, rgba(0,0,20,0) 40%, rgba(0,238,255,0.12) 100%)',
    animation: 'bgshift 4s ease-in-out infinite alternate',
  },
  topStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    background: 'linear-gradient(90deg, #ff0066, #ffe600, #00eeff, #cc00ff, #ff0066)',
    backgroundSize: '200% 100%',
    animation: 'stripe 3s linear infinite',
  },
  bottomStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    background: 'linear-gradient(90deg, #00eeff, #ff0066, #ffe600, #cc00ff, #00eeff)',
    backgroundSize: '200% 100%',
    animation: 'stripe 3s linear infinite reverse',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    zIndex: 1,
    padding: '0 60px',
    textAlign: 'center',
  },
  badge: {
    background: 'linear-gradient(135deg, #ff0066, #cc0099)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: 4,
    padding: '8px 28px',
    borderRadius: 40,
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 0 20px rgba(255,0,102,0.5)',
  },
  title: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: 900,
    fontFamily: 'system-ui, sans-serif',
    textShadow: '0 0 30px rgba(255,0,102,0.6), 0 2px 8px rgba(0,0,0,0.8)',
    lineHeight: 1.1,
  },
  artist: {
    color: '#00eeff',
    fontSize: 28,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 500,
    textShadow: '0 0 20px rgba(0,238,255,0.5)',
  },
  watermark: {
    position: 'absolute',
    bottom: 24,
    right: 32,
    opacity: 0.7,
  },
};
```

**Step 3: Add animation keyframes** to `monitor/index.html` `<style>`:
```css
@keyframes bgshift {
  from { opacity: 0.8; }
  to   { opacity: 1; }
}
@keyframes stripe {
  from { background-position: 0% 0%; }
  to   { background-position: 200% 0%; }
}
```

**Step 4: Verify visually** — queue a song and watch the transition screen.

**Step 5: Commit**

```bash
git add monitor/src/components/TransitionScreen.tsx monitor/index.html
git commit -m "feat: J-karaoke transition screen redesign"
```

---

## Task 9: Controller — BottomNav Redesign

**Goal:** Replace the minimal bottom nav with a colorful glowing tab bar.

**Files:**
- Modify: `controller/src/components/BottomNav.tsx`

**Step 1: Read the current file first.**

**Step 2: Redesign the nav**

Key changes:
- Background: `#0a0014` with top border gradient
- Active tab: glowing colored indicator (pink for Home, cyan for Search, yellow for Queue)
- Icon + label layout, larger tap targets
- Glow effect on active tab

Each tab gets a distinct accent color:
- Home: `#ff0066` (pink)
- Search: `#00eeff` (cyan)
- Queue: `#ffe600` (yellow)

Active tab shows: colored icon, colored label, colored underline glow bar.

**Step 3: Commit**

```bash
git add controller/src/components/BottomNav.tsx
git commit -m "feat: colorful glowing bottom nav for controller"
```

---

## Task 10: Controller — NowPlayingBar Redesign

**Goal:** Make the now-playing bar vivid with a pink gradient background.

**Files:**
- Modify: `controller/src/components/NowPlayingBar.tsx`

**Step 1: Read the current file first.**

**Step 2: Key design changes:**
- Background: `linear-gradient(135deg, #1a0033, #330011)` with `border-top: 2px solid #ff0066`
- Song title: white bold
- Artist: `#ff6699`
- Skip button: cyan glow `#00eeff`
- Pause/play button: hot pink `#ff0066`
- Add a pulsing pink dot "now playing" indicator

**Step 3: Commit**

```bash
git add controller/src/components/NowPlayingBar.tsx
git commit -m "feat: vivid now-playing bar redesign"
```

---

## Task 11: Controller — SongCard Redesign

**Goal:** Make search result / song cards pop with colorful borders and gradients.

**Files:**
- Modify: `controller/src/components/SongCard.tsx`

**Step 1: Read the current file first.**

**Step 2: Key design changes:**
- Card background: `rgba(255,255,255,0.06)` with `border: 1px solid rgba(255,255,255,0.12)`
- Left accent bar: `3px solid #ff0066` (pink)
- "Add to Queue" button: cyan gradient `linear-gradient(135deg, #00eeff, #0088ff)`, black text, bold
- Song title: white
- Artist: `#ff6699`
- Duration: `rgba(255,255,255,0.45)`
- Hover/active: background brightens slightly
- Thumbnail: small rounded square, left side

**Step 3: Commit**

```bash
git add controller/src/components/SongCard.tsx
git commit -m "feat: colorful song card redesign"
```

---

## Task 12: Controller — SearchScreen Redesign

**Goal:** J-karaoke search screen with vivid colors.

**Files:**
- Modify: `controller/src/screens/SearchScreen.tsx`

**Step 1: Read the current file first.**

**Step 2: Key design changes:**
- Screen background: `#0a0014`
- Search input: dark background `rgba(255,255,255,0.08)`, `border: 1.5px solid #ff0066`, white text, pink focus glow
- Search button / icon: hot pink
- Language tabs (All / EN / JA): pill-style, active = pink gradient, inactive = dark with white text
- Results list: uses SongCard (already redesigned)
- Empty state: friendly cyan text

**Step 3: Commit**

```bash
git add controller/src/screens/SearchScreen.tsx
git commit -m "feat: J-karaoke search screen redesign"
```

---

## Task 13: Controller — QueueScreen Redesign

**Goal:** Vivid queue screen.

**Files:**
- Modify: `controller/src/screens/QueueScreen.tsx`

**Step 1: Read the current file first.**

**Step 2: Key design changes:**
- Background: `#0a0014`
- "Now Playing" header badge: pink gradient pill
- Queue position numbers: big, bold, colored (1=pink, 2=cyan, 3=yellow, rest=white)
- Remove button: `rgba(255,0,102,0.2)` background, pink `×`
- Empty state: cyan with karaoke mic emoji
- "Skip" button: yellow gradient

**Step 3: Commit**

```bash
git add controller/src/screens/QueueScreen.tsx
git commit -m "feat: J-karaoke queue screen redesign"
```

---

## Task 14: Controller — HomeScreen Redesign

**Goal:** Vivid home screen with colorful section headers.

**Files:**
- Modify: `controller/src/screens/HomeScreen.tsx`

**Step 1: Read the current file first.**

**Step 2: Key design changes:**
- Background: `#0a0014`
- Top header: Big Echo logo (small, ~200px wide) or stylised "BIG ECHO" text in red
- Search bar: pink-bordered, prominent at top
- Section headers ("Recent", "Favorites"): colored pill labels (pink, cyan)
- Song list items: use updated SongCard style
- Colorful stripe separator between sections

**Step 3: Commit**

```bash
git add controller/src/screens/HomeScreen.tsx
git commit -m "feat: J-karaoke home screen redesign"
```

---

## Task 15: Controller — App Shell Background

**Goal:** Ensure the overall controller app background matches the dark theme.

**Files:**
- Modify: `controller/src/App.tsx`

**Step 1: Read the current file first.**

**Step 2:** Set the root div background to `#0a0014`. Ensure the font family is `system-ui, sans-serif` throughout. Remove any lingering light-colored backgrounds.

**Step 3: Commit**

```bash
git add controller/src/App.tsx
git commit -m "feat: apply dark J-karaoke background to controller app shell"
```

---

## Task 16: Final Pass & Todo Entry

**Goal:** Verify everything looks right end-to-end, add the future song announcement todo.

**Step 1: Start dev server and test full flow**

```bash
npm run dev
```

Check:
- [ ] Monitor idle: particle animation, Big Echo logo, Spotify plays (if configured), announcements fire after ~30s
- [ ] Controller: all screens are dark/colorful — no white backgrounds remaining
- [ ] Queue a song → transition screen shows J-karaoke style with rainbow stripes
- [ ] Song plays → playing mode overlay still readable
- [ ] Skip works without crash

**Step 2: Update memory with Spotify setup notes**

Add to `MEMORY.md`:
- Spotify env vars needed: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, `SPOTIFY_REFRESH_TOKEN`
- Run `npm run spotify-auth` once to get the refresh token
- Optional: `VITE_SPOTIFY_PLAYLIST_URI` on monitor to set the idle playlist

**Step 3: Commit the plan doc and todo**

```bash
git add docs/plans/2026-03-07-gaudy-ux-spotify-idle.md
git commit -m "docs: add UX redesign + Spotify idle mode implementation plan

TODO (future): song-specific announcements before playback — announcements
triggered by SONG_STARTING socket event, content generated based on song
title/artist (language detection, fun karaoke-style intros)."
```

---

## Environment Variables Summary

| Variable | Required | Description |
|---|---|---|
| `SPOTIFY_CLIENT_ID` | Yes | From Spotify Developer Dashboard |
| `SPOTIFY_CLIENT_SECRET` | Yes | From Spotify Developer Dashboard |
| `SPOTIFY_REDIRECT_URI` | Yes | `https://127.0.0.1:3001/api/spotify/callback` |
| `SPOTIFY_REFRESH_TOKEN` | Yes (after auth) | From `npm run spotify-auth` |
| `VITE_SPOTIFY_PLAYLIST_URI` | No | Spotify playlist URI for idle music (e.g. `spotify:playlist:37i9dQZF1DX9tPFwDMOaN1`) |
