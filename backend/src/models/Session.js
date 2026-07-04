import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ready", "waiting", "live", "completed"],
      default: "scheduled",
    },
    participants: {
      mentor: { type: Boolean, default: false },
      mentee: { type: Boolean, default: false },
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    scheduledAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
