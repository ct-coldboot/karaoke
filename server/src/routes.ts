import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import * as os from 'os';
import { searchYouTube, getStreamUrl } from './youtube';
import { getSpotifyAccessToken } from './spotify';
import https from 'https';

const router = Router();

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const ifaces of Object.values(interfaces)) {
    for (const iface of ifaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

router.get('/info', (_req, res) => {
  res.json({ ip: getLocalIP(), controllerPort: 5174 });
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 searches per minute per IP
  message: { error: 'Too many searches, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

const streamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many stream requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

const VALID_TTS_LANGS = new Set(['ja', 'en', 'ko', 'zh-CN', 'zh-TW', 'es', 'fr', 'de']);

router.get('/tts', (req: Request, res: Response) => {
  const text = (req.query.text as string | undefined)?.trim();
  const lang = (req.query.lang as string | undefined) ?? 'ja';

  if (!text || text.length > 300) {
    res.status(400).json({ error: 'Missing or too-long text' });
    return;
  }
  if (!VALID_TTS_LANGS.has(lang)) {
    res.status(400).json({ error: 'Invalid lang' });
    return;
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  const request = https.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  }, (upstream) => {
    if (upstream.statusCode !== 200) {
      res.status(502).json({ error: 'TTS upstream error' });
      upstream.resume();
      return;
    }
    res.setHeader('Content-Type', upstream.headers['content-type'] ?? 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    upstream.pipe(res);
  });
  request.on('error', () => res.status(502).json({ error: 'TTS request failed' }));
});

const VALID_LANGS = new Set(['all', 'en', 'ja']);
const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

router.get('/search', searchLimiter, async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim();
  const lang = (req.query.lang as string | undefined) ?? 'all';

  if (!q) {
    res.status(400).json({ error: 'Missing query parameter: q' });
    return;
  }

  if (q.length > 200) {
    res.status(400).json({ error: 'Query too long' });
    return;
  }

  if (!VALID_LANGS.has(lang)) {
    res.status(400).json({ error: 'Invalid lang parameter' });
    return;
  }

  try {
    const results = await searchYouTube(q, lang);
    res.json({ results });
  } catch (err) {
    console.error('YouTube search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/stream/:videoId/proxy', streamLimiter, async (req: Request, res: Response) => {
  const { videoId } = req.params;
  if (!YOUTUBE_ID_RE.test(videoId)) {
    res.status(400).json({ error: 'Invalid video ID' });
    return;
  }
  try {
    const streamUrl = await getStreamUrl(videoId);
    res.redirect(302, streamUrl);
  } catch (err) {
    console.error('Stream URL error:', err);
    res.status(500).json({ error: 'Could not resolve stream URL' });
  }
});

router.get('/spotify/token', async (_req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    res.json({ token });
  } catch (err) {
    console.error('Spotify token error:', err);
    res.status(503).json({ error: 'Spotify unavailable' });
  }
});

export default router;
