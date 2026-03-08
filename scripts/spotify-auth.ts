import * as readline from 'readline';
import * as https from 'https';
import * as url from 'url';

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI  = process.env.SPOTIFY_REDIRECT_URI;

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

rl.question('Paste the redirect URL here: ', (redirectUrl) => {
  rl.close();
  let parsed: url.URL;
  try {
    parsed = new url.URL(redirectUrl);
  } catch {
    console.error('Invalid URL. Please paste the full redirect URL from the address bar.');
    process.exit(1);
  }
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
      if (res.statusCode !== 200) {
        console.error(`Token exchange failed with status ${res.statusCode}.`);
        process.exit(1);
      }
      let json: Record<string, unknown>;
      try {
        json = JSON.parse(data) as Record<string, unknown>;
      } catch {
        console.error('Failed to parse token response as JSON.');
        process.exit(1);
      }
      if (json.error) {
        console.error('Token exchange failed:', json.error, json.error_description ?? '');
        process.exit(1);
      }
      console.log('\n=== SUCCESS ===\n');
      console.log('Add this to your user environment variables:\n');
      console.log(`SPOTIFY_REFRESH_TOKEN=${json.refresh_token}`);
      console.log('\nThen restart your terminal and run: npm run dev\n');
    });
  });

  req.on('error', (err) => { console.error('Request error:', err.message); process.exit(1); });
  req.write(body);
  req.end();
});
