import { useEffect, useState } from 'react';
import { QueueState } from '@karaoke/shared';
import * as Events from '@karaoke/shared';
import { useSocket } from './useSocket';

const initialState: QueueState = {
  mode: 'idle',
  currentSong: null,
  queue: [],
  isPlaying: false,
};

export function useQueue() {
  const [queueState, setQueueState] = useState<QueueState>(initialState);
  const socketActions = useSocket();

  useEffect(() => {
    const s = socketActions.socket;
    s.on(Events.QUEUE_STATE, (state: QueueState) => {
      setQueueState(state);
    });
    return () => {
      s.off(Events.QUEUE_STATE);
    };
  }, [socketActions.socket]);

  return { queueState, ...socketActions };
}
