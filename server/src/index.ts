import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import apiRouter from './routes';
import { initQueue, addToQueue, removeFromQueue, skip, pause, resume, songEnded, getState } from './queue';
import * as Events from '@karaoke/shared';
import { SearchResult } from '@karaoke/shared';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', apiRouter);

// Serve built static files in production
const monitorDist = path.join(__dirname, '../../monitor/dist');
const controllerDist = path.join(__dirname, '../../controller/dist');
app.use('/monitor', express.static(monitorDist));
app.use('/controller', express.static(controllerDist));

initQueue(io);

// Runtime validation helpers
function isValidSearchResult(obj: unknown): obj is SearchResult {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.youtubeId === 'string' && s.youtubeId.length > 0 &&
    typeof s.title === 'string' &&
    typeof s.artist === 'string' &&
    typeof s.duration === 'number' &&
    typeof s.thumbnail === 'string'
  );
}

function isValidSongId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0;
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current state to newly connected client
  socket.emit(Events.QUEUE_STATE, getState());

  socket.on(Events.ADD_TO_QUEUE, (data: unknown) => {
    if (!data || typeof data !== 'object' || !isValidSearchResult((data as Record<string, unknown>).song)) {
      console.warn('ADD_TO_QUEUE: invalid payload from', socket.id);
      return;
    }
    addToQueue((data as { song: SearchResult }).song);
  });

  socket.on(Events.REMOVE_FROM_QUEUE, (data: unknown) => {
    if (!data || typeof data !== 'object' || !isValidSongId((data as Record<string, unknown>).songId)) {
      console.warn('REMOVE_FROM_QUEUE: invalid payload from', socket.id);
      return;
    }
    removeFromQueue((data as { songId: string }).songId);
  });

  socket.on(Events.SKIP, () => { skip(); });
  socket.on(Events.PAUSE, () => { pause(); });
  socket.on(Events.RESUME, () => { resume(); });
  socket.on(Events.SONG_ENDED, () => { songEnded(); });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = parseInt(process.env.PORT ?? '3001', 10);
httpServer.listen(PORT, () => {
  console.log(`Karaoke server running on http://localhost:${PORT}`);
});
