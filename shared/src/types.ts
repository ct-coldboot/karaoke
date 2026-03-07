export interface Song {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  addedAt: number;
}

export interface QueueState {
  mode: 'idle' | 'transition' | 'playing';
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
}

export interface SearchResult {
  youtubeId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
}
