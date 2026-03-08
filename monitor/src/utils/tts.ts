/**
 * TTS abstraction layer.
 *
 * Provider is controlled by the VITE_TTS_PROVIDER env var:
 *   native  (default) — window.speechSynthesis, works locally / on the monitor directly
 *   google             — Google Translate TTS via <Audio>, works when tab-casting via Chromecast
 *
 * Future providers (not yet implemented):
 *   elevenlabs         — ElevenLabs API, set VITE_ELEVENLABS_API_KEY
 */

type TTSProvider = 'native' | 'google';

const provider: TTSProvider =
  (import.meta.env.VITE_TTS_PROVIDER as TTSProvider) || 'native';

let activeAudio: HTMLAudioElement | null = null;

export interface TTSOptions {
  rate?: number;
  pitch?: number;
}

export function speakTTS(text: string, lang = 'ja-JP', options: TTSOptions = {}): void {
  cancelTTS();

  if (provider === 'native') {
    if (!window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    if (options.rate !== undefined) utt.rate = options.rate;
    if (options.pitch !== undefined) utt.pitch = options.pitch;
    window.speechSynthesis.speak(utt);
  } else if (provider === 'google') {
    const langCode = lang.split('-')[0]; // 'ja' from 'ja-JP'
    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${langCode}`;
    activeAudio = new Audio(url);
    activeAudio.play().catch(console.error);
  }
}

export function cancelTTS(): void {
  if (provider === 'native') {
    window.speechSynthesis?.cancel();
  } else if (provider === 'google') {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.src = '';
      activeAudio = null;
    }
  }
}
