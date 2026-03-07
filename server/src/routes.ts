import { Router, Request, Response } from 'express';
import { searchYouTube } from './youtube';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim();
  const lang = (req.query.lang as string | undefined) ?? 'all';

  if (!q) {
    res.status(400).json({ error: 'Missing query parameter: q' });
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
