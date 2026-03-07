import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { QueueState } from '@karaoke/shared';
import * as Events from '@karaoke/shared';

const initialState: QueueState = {
  mode: 'idle',
  currentSong: null,
  queue: [],
  isPlaying: false,
};

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io({ path: '/socket.io' });
  }
  return socket;
}

export function useSocket() {
  const [queueState, setQueueState] = useState<QueueState>(initialState);

  useEffect(() => {
    const s = getSocket();

    s.on(Events.QUEUE_STATE, (state: QueueState) => {
      setQueueState(state);
    });

    return () => {
      s.off(Events.QUEUE_STATE);
    };
  }, []);

  function emitSongEnded() {
    getSocket().emit(Events.SONG_ENDED);
  }

  return { queueState, emitSongEnded };
}
