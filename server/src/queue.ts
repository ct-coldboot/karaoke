import { v4 as uuidv4 } from 'uuid';
import { Song, QueueState, SearchResult } from '@karaoke/shared';
import { Server } from 'socket.io';
import * as Events from '@karaoke/shared';

const TRANSITION_DURATION_MS = 4000;

let state: QueueState = {
  mode: 'idle',
  currentSong: null,
  queue: [],
  isPlaying: false,
};

let io: Server;
let transitionTimer: ReturnType<typeof setTimeout> | null = null;

export function initQueue(socketServer: Server) {
  io = socketServer;
}

function broadcast() {
  io.emit(Events.QUEUE_STATE, state);
}

function startTransitionTimer() {
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    transitionTimer = null;
    state.mode = 'playing';
    state.isPlaying = true;
    broadcast();
  }, TRANSITION_DURATION_MS);
}

export function getState(): QueueState {
  return state;
}

export function addToQueue(result: SearchResult): void {
  const song: Song = {
    id: uuidv4(),
    youtubeId: result.youtubeId,
    title: result.title,
    artist: result.artist,
    duration: result.duration,
    thumbnail: result.thumbnail,
    addedAt: Date.now(),
  };

  if (state.mode === 'idle') {
    state.currentSong = song;
    state.mode = 'transition';
    state.isPlaying = false;
    startTransitionTimer();
  } else {
    state.queue = [...state.queue, song];
  }

  broadcast();
}

export function removeFromQueue(songId: string): void {
  state.queue = state.queue.filter((s) => s.id !== songId);
  broadcast();
}

export function skip(): void {
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
  advanceQueue();
}

export function pause(): void {
  if (state.mode === 'playing') {
    state.isPlaying = false;
    broadcast();
  }
}

export function resume(): void {
  if (state.mode === 'playing') {
    state.isPlaying = true;
    broadcast();
  }
}

export function songEnded(): void {
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
  advanceQueue();
}

function advanceQueue(): void {
  if (state.queue.length > 0) {
    const [next, ...rest] = state.queue;
    state.currentSong = next;
    state.queue = rest;
    state.mode = 'transition';
    state.isPlaying = false;
    startTransitionTimer();
  } else {
    state.currentSong = null;
    state.mode = 'idle';
    state.isPlaying = false;
  }
  broadcast();
}
