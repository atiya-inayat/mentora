/**
 * RefreshToken Model
 * 
 * Stores refresh tokens in database for security and rotation.
 * 
 * Security Features:
 * - Token rotation: New refresh token on each use
 * - Token revocation: Invalidate all tokens on logout
 * - Token family: Track all tokens from same login session
 * - Expiry tracking: Automatic cleanup of expired tokens
 * 
 * Why store refresh tokens?
 * 1. Prevent reuse of stolen tokens (rotation)
 * 2. Allow logout to invalidate all tokens (revocation)
 * 3. Track active sessions for user awareness
 * 4. Detect suspicious activity
 */

import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  // The user this token belongs to
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // The actual refresh token value (hashed)
  // We hash it because we can't verify it without storing the original
  token: {
    type: String,
    required: true,
    unique: true,
  },

  // Token family ID - groups all tokens from same login
  // Used to invalidate all tokens from same session
  tokenFamily: {
    type: String,
    required: true,
    index: true,
  },

  // When this token was created
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // When this token expires
  expiresAt: {
    type: Date,
    required: true,
  },

  // Is this token revoked?
  isRevoked: {
    type: Boolean,
    default: false,
  },

  // What type of token is this
  tokenType: {
    type: String,
    enum: ["refresh"],
    default: "refresh",
  },

  // Device/browser info (optional - for user awareness)
  userAgent: {
    type: String,
  },

  // IP address (optional - for security monitoring)
  ipAddress: {
    type: String,
  },
});

// Index for efficient queries
refreshTokenSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

// Auto-delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash the token before saving (for security)
refreshTokenSchema.pre("save", function (next) {
  // Token should already be hashed when saved
  next();
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;