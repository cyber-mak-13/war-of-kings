import { Server } from 'socket.io';
import matchmakingService from '../services/matchmaking.service.js';
import { GameRoom } from '../engine/game.room.js';

/**
 * Stores active game rooms indexed by roomId.
 * @type {Map<string, GameRoom>}
 */
const activeRooms = new Map();

/**
 * Initializes socket.io connection handling.
 * @param {Server} io - The Socket.IO server instance.
 */
export default function setupGameSockets(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    /**
     * Handles player joining the matchmaking queue.
     */
    socket.on('joinQueue', async (playerData) => {
      try {
        const player = {
          id: socket.id,
          name: playerData.name || `Player ${socket.id.substr(0, 4)}`,
          rating: playerData.rating || 1000,
        };

        socket.emit('queueJoined', { status: 'waiting' });
        
        const match = matchmakingService.addPlayer(player);

        if (match) {
          const { player1, player2 } = match;
          const roomId = `room_${player1.id}_${player2.id}`;

          const room = new GameRoom(roomId, player1, player2);
          activeRooms.set(roomId, room);

          io.to(player1.id).to(player2.id).emit('matchFound', {
            roomId,
            players: [player1, player2],
            state: room.getState(),
          });

          console.log(`Match started: ${roomId}`);
        }
      } catch (error) {
        console.error('Error in joinQueue:', error);
        socket.emit('error', { message: 'Failed to join queue' });
      }
    });

    /**
     * Handles player actions within a game room.
     */
    socket.on('playerAction', (data) => {
      const { roomId, action } = data;
      const room = activeRooms.get(roomId);

      if (room) {
        try {
          room.processAction(socket.id, action);
          
          io.to(roomId).emit('gameStateUpdate', room.getState());

          if (room.isGameOver()) {
            const result = room.getResults();
            io.to(roomId).emit('gameOver', result);
            activeRooms.delete(roomId);
            console.log(`Game over: ${roomId}`);
          }
        } catch (error) {
          console.error(`Error processing action in room ${roomId}:`, error);
          socket.emit('error', { message: 'Invalid action' });
        }
      } else {
        socket.emit('error', { message: 'Game room not found' });
      }
    });

    /**
     * Handles player disconnection.
     */
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      matchmakingService.removePlayer(socket.id);

      // Handle disconnection from active games
      for (const [roomId, room] of activeRooms.entries()) {
        if (room.hasPlayer(socket.id)) {
          room.handleDisconnect(socket.id);
          io.to(roomId).emit('playerDisconnected', { playerId: socket.id });
          
          if (room.isEmpty()) {
             activeRooms.delete(roomId);
             console.log(`Empty room deleted: ${roomId}`);
          }
          break; // Player can only be in one room
        }
      }
    });
  });
}