import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes';
import { initQueue, addToQueue, removeFromQueue, skip, pause, resume, songEnded, getState } from './queue';
import * as Events from '@karaoke/shared';
import { SearchResult } from '@karaoke/shared';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());
app.use('/api', apiRouter);

// Serve built static files in production
const monitorDist = path.join(__dirname, '../../monitor/dist');
const controllerDist = path.join(__dirname, '../../controller/dist');
app.use('/monitor', express.static(monitorDist));
app.use('/controller', express.static(controllerDist));

initQueue(io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current state to newly connected client
  socket.emit(Events.QUEUE_STATE, getState());

  socket.on(Events.ADD_TO_QUEUE, (data: { song: SearchResult }) => {
    addToQueue(data.song);
  });

  socket.on(Events.REMOVE_FROM_QUEUE, (data: { songId: string }) => {
    removeFromQueue(data.songId);
  });

  socket.on(Events.SKIP, () => {
    skip();
  });

  socket.on(Events.PAUSE, () => {
    pause();
  });

  socket.on(Events.RESUME, () => {
    resume();
  });

  socket.on(Events.SONG_ENDED, () => {
    songEnded();
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => {
  console.log(`Karaoke server running on http://localhost:${PORT}`);
});
