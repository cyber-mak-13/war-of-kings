const queue = [];

/**
 * Adds a player to the matchmaking queue.
 * @param {string} playerId - The ID of the player.
 * @param {object} socket - The player's socket object.
 */
export const addToQueue = (playerId, socket) => {
  if (!queue.find(p => p.playerId === playerId)) {
    queue.push({ playerId, socket });
  }
};

/**
 * Removes a player from the matchmaking queue.
 * @param {string} playerId - The ID of the player.
 */
export const removeFromQueue = (playerId) => {
  const index = queue.findIndex(p => p.playerId === playerId);
  if (index !== -1) {
    queue.splice(index, 1);
  }
};

/**
 * Attempts to match two players in the queue.
 * @returns {object|null} An object containing player1 and player2 if a match is found, otherwise null.
 */
export const findMatch = () => {
  if (queue.length >= 2) {
    const player1 = queue.shift();
    const player2 = queue.shift();
    return { player1, player2 };
  }
  return null;
};