import mongoose from 'mongoose';

/**
 * Mongoose schema definition for player profiles.
 * Stores authentication details, statistics, and current status.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    elo: {
      type: Number,
      default: 1000,
      index: true,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook example for password hashing (placeholder logic)
// In a real project, replace this with bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  // Simplified replacement logic, do not use in production without hashing
  // this.password = await hashFunction(this.password);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;