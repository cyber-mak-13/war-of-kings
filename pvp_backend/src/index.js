import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import registerGameHandlers from './sockets/game.socket.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

/**
 * Starts the Node.js game backend application.
 * Establishes database connection, initializes socket handlers, and listens on port.
 */
async function startServer() {
  const PORT = process.env.PORT || 3000;

  try {
    await connectDB();
    console.log('Database connected successfully.');

    registerGameHandlers(io);
    console.log('Game socket handlers registered.');

    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();