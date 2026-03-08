import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SearchResult } from '@karaoke/shared';
import * as Events from '@karaoke/shared';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io({ path: '/socket.io' });
  }
  return socket;
}

export function useSocket() {
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    const s = socketRef.current;
    return () => {
      // Don't disconnect — keep persistent connection
      void s;
    };
  }, []);

  function addToQueue(song: SearchResult, queuedBy?: string) {
    socketRef.current.emit(Events.ADD_TO_QUEUE, { song, queuedBy });
  }

  function removeFromQueue(songId: string) {
    socketRef.current.emit(Events.REMOVE_FROM_QUEUE, { songId });
  }

  function skip() {
    socketRef.current.emit(Events.SKIP);
  }

  function pause() {
    socketRef.current.emit(Events.PAUSE);
  }

  function resume() {
    socketRef.current.emit(Events.RESUME);
  }

  return { addToQueue, removeFromQueue, skip, pause, resume, socket: socketRef.current };
}
