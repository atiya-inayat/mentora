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
      enum: ["pending", "ongoing", "completed"],
      default: "pending",
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Session", sessionSchema);
