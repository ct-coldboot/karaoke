import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { searchYouTube, getStreamUrl } from './youtube';
import { getSpotifyAccessToken } from './spotify';

const router = Router();

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
