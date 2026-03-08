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
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`Spotify token refresh failed with status ${res.statusCode}: ${data}`));
          }
          const json = JSON.parse(data) as Record<string, unknown>;
          if (!json.access_token) {
            return reject(new Error(`Spotify token refresh failed: ${json.error ?? 'no access_token'}`));
          }
          cachedToken = json.access_token as string;
          tokenExpiresAt = Date.now() + (json.expires_in as number) * 1000;
          if (json.refresh_token) {
            process.env.SPOTIFY_REFRESH_TOKEN = json.refresh_token as string;
          }
          resolve(cachedToken);
        } catch (err) {
          reject(new Error(`Failed to parse Spotify token response: ${(err as Error).message}`));
        }
      });
    });

    req.on('error', (err) => reject(new Error(`Spotify token request failed: ${err.message}`)));
    req.write(body);
    req.end();
  });
}
