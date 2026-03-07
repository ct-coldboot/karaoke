import { execFile } from 'child_process';
import { promisify } from 'util';
import { SearchResult } from '@karaoke/shared';

const execFileAsync = promisify(execFile);

interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function buildQuery(query: string, lang: string): string {
  switch (lang) {
    case 'en':
      return `ytsearch10:${query} karaoke english`;
    case 'ja':
      return `ytsearch10:${query} カラオケ`;
    default:
      return `ytsearch10:${query} karaoke`;
  }
}

function parseDuration(raw: number | null | undefined): number {
  if (!raw) return 0;
  return Math.round(raw);
}

function parseThumbnail(entry: Record<string, unknown>): string {
  const thumbnails = entry.thumbnails as Array<{ url: string; width?: number; height?: number }> | undefined;
  if (thumbnails && thumbnails.length > 0) {
    // prefer medium quality (around 320x180)
    const medium = thumbnails.find((t) => t.width && t.width >= 320 && t.width <= 480);
    return (medium ?? thumbnails[thumbnails.length - 1]).url;
  }
  const id = entry.id as string;
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

export async function searchYouTube(query: string, lang: string): Promise<SearchResult[]> {
  const cacheKey = `${lang}:${query}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  const ytQuery = buildQuery(query, lang);

  const { stdout } = await execFileAsync('yt-dlp', [
    ytQuery,
    '--dump-json',
    '--no-playlist',
    '--flat-playlist',
    '--no-warnings',
  ]);

  const lines = stdout.trim().split('\n').filter(Boolean);
  const results: SearchResult[] = lines
    .map((line) => {
      try {
        const entry = JSON.parse(line) as Record<string, unknown>;
        return {
          youtubeId: entry.id as string,
          title: (entry.title as string) ?? 'Unknown',
          artist: (entry.channel as string) ?? (entry.uploader as string) ?? 'Unknown',
          duration: parseDuration(entry.duration as number | null),
          thumbnail: parseThumbnail(entry),
        } satisfies SearchResult;
      } catch {
        return null;
      }
    })
    .filter((r): r is SearchResult => r !== null);

  cache.set(cacheKey, { results, timestamp: Date.now() });
  return results;
}
