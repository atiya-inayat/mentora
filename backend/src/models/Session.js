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
      enum: ["pending", "happening", "done"],
      default: pending,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Session", sessionSchema);
