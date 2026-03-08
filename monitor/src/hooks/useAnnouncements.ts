import { useEffect, useRef } from 'react';
import { speakTTS, cancelTTS } from '../utils/tts';

const ANNOUNCEMENTS = [
  { text: 'ご来店ありがとうございます！ビッグエコーへようこそ！', lang: 'ja-JP' },
  { text: '只今、お客様のために最高のカラオケをご用意しております！', lang: 'ja-JP' },
  { text: '歌いたい曲は、コントローラーから検索できます！どうぞお楽しみください！', lang: 'ja-JP' },
  { text: 'ビッグエコーでは、毎日が歌のお祭りです！皆様、思う存分歌いましょう！', lang: 'ja-JP' },
  { text: 'お待たせしました！まもなく素晴らしい曲をお届けします！', lang: 'ja-JP' },
  { text: 'Thank you so much for coming Big Inu tonight! Please enjoy your karaoke very much!', lang: 'ja-JP' },
  { text: 'We have many many songs for you! Please use controller to find your favorite song!', lang: 'ja-JP' },
  { text: 'Big Inu is number one karaoke entertainment in the world! Please sing everyone together!', lang: 'ja-JP' },
  { text: 'Tonight is very special karaoke night! Please enjoy and have wonderful time!', lang: 'ja-JP' },
  { text: 'If you want to sing song, please search from controller! Thank you very much!', lang: 'ja-JP' },
];

const MIN_INTERVAL_MS = 3 * 60 * 1000;
const MAX_INTERVAL_MS = 5 * 60 * 1000;
const INITIAL_DELAY_MS = 30_000;


export function useAnnouncements(active: boolean) {
  const indexRef = useRef(Math.floor(Math.random() * ANNOUNCEMENTS.length));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      cancelTTS();
      return;
    }

    function fireNext() {
      const announcement = ANNOUNCEMENTS[indexRef.current % ANNOUNCEMENTS.length];
      indexRef.current++;
      speakTTS(announcement.text, announcement.lang, { rate: 0.9, pitch: 1.1 });
      scheduleNext();
    }

    function scheduleNext() {
      const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
      timerRef.current = setTimeout(fireNext, delay);
    }

    timerRef.current = setTimeout(fireNext, INITIAL_DELAY_MS);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      cancelTTS();
    };
  }, [active]);
}
