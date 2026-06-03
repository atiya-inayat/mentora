import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  token: {
    type: String,
    required: true,
    unique: true,
  },

  tokenFamily: {
    type: String,
    required: true,
    index: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
    required: true,
  },

  isRevoked: {
    type: Boolean,
    default: false,
  },

  revokedAt: {
    type: Date,
    default: null,
  },

  tokenType: {
    type: String,
    enum: ["refresh"],
    default: "refresh",
  },

  userAgent: {
    type: String,
  },

  ipAddress: {
    type: String,
  },
});

refreshTokenSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ isRevoked: 1 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
