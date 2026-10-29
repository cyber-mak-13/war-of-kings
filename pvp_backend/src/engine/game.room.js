import { updatePlayerScore } from '../services/profile.service.js';

export default class GameRoom {
  /**
   * Creates a new game room instance.
   * @param {string} roomId - Unique identifier for the room.
   * @param {string[]} playerIds - Array of player IDs joined to this room.
   * @param {object} io - Socket.io server instance to emit global messages.
   */
  constructor(roomId, playerIds, io) {
    this.roomId = roomId;
    this.playerIds = playerIds;
    this.io = io;
    this.state = {
      status: 'active', // active, finished
      scores: playerIds.reduce((acc, current) => {
        acc[current] = 0;
        return acc;
      }, {}),
      timer: 60 // 60 seconds duration
    };
    this.interval = null;
    this.startTimer();
  }

  /**
   * Starts the internal game timer.
   * Decrements timer and broadcats state. End game on 0.
   * @private
   */
  startTimer() {
    this.interval = setInterval(() => {
      this.state.timer -= 1;
      
      if (this.state.timer <= 0) {
        this.endGame();
      } else {
        this.broadcastState('game_tick');
      }
    }, 1000);
  }

  /**
   * Broadcasts current game state to all players in the room.
   * @param {string} messageType - The socket event name.
   */
  broadcastState(messageType) {
    this.io.to(this.roomId).emit(messageType, this.state);
  }

  /**
   * Handles an action from a player (e.g., scoring an event).
   * @param {string} playerId - ID of the player performing the action.
   * @param {object} action - Action details.
   */
  handlePlayerAction(playerId, action) {
    if (this.state.status !== 'active') return;

    if (action.type === 'increment_score' && this.state.scores[playerId] !== undefined) {
      this.state.scores[playerId] += (action.payload || 1);
      this.broadcastState('game_state_update');
    }
  }

  /**
   * Terminates the game, runs end-of-game logic, and saves results.
   * @async
   * @private
   */
  async endGame() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    this.state.status = 'finished';
    this.broadcastState('game_ended');

    // Calculate winner
    let winnerId = null;
    let maxScore = -1;
    for (const playerId of this.playerIds) {
      if (this.state.scores[playerId] > maxScore) {
        winnerId = playerId;
        maxScore = this.state.scores[playerId];
      } else if (this.state.scores[playerId] === maxScore) {
        winnerId = null; // Draw
      }
    }

    // Persist scores
    try {
      const updatePromises = this.playerIds.map(playerId => {
        const score = this.state.scores[playerId];
        const isWinner = playerId === winnerId;
        // Simple scoring update, assumes service handles logic
        return updatePlayerScore(playerId, score, isWinner);
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error(`Error saving game results for room ${this.roomId}:`, error);
    }
  }

  /**
   * Cleans up resources if player disconnects prematurely
   */
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}