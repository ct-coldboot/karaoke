import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { searchYouTube } from './youtube';

const router = Router();

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 searches per minute per IP
  message: { error: 'Too many searches, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

const VALID_LANGS = new Set(['all', 'en', 'ja']);

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

export default router;
