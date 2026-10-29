import User from '../models/user.model.js';

/**
 * Creates a new player profile.
 * @param {string} username - The unique username for the player.
 * @returns {Promise<Object>} The created user document.
 */
export const createProfile = async (username) => {
  try {
    const user = new User({ username });
    return await user.save();
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a player profile by unique username.
 * @param {string} username - The username to search for.
 * @returns {Promise<Object|null>} The user document or null if not found.
 */
export const getProfileByUsername = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (error) {
    throw error;
  }
};

/**
 * Updates a player's score after a game ends.
 * @param {string} username - The username of the player.
 * @param {number} scoreDelta - The amount to change the score by (positive or negative).
 * @returns {Promise<Object|null>} The updated user document.
 */
export const updatePlayerScore = async (username, scoreDelta) => {
  try {
    return await User.findOneAndUpdate(
      { username },
      { $inc: { score: scoreDelta } },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves the top players based on score.
 * @param {number} [limit=10] - Number of players to retrieve.
 * @returns {Promise<Array<Object>>} List of user documents.
 */
export const getLeaderboard = async (limit = 10) => {
  try {
    return await User.find()
      .sort({ score: -1 })
      .limit(limit);
  } catch (error) {
    throw error;
  }
};