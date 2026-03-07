// Controller → Server
export const ADD_TO_QUEUE = 'add_to_queue';
export const REMOVE_FROM_QUEUE = 'remove_from_queue';
export const SKIP = 'skip';
export const PAUSE = 'pause';
export const RESUME = 'resume';

// Server → All clients
export const QUEUE_STATE = 'queue_state';

// Monitor → Server
export const SONG_ENDED = 'song_ended';
