import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    slots: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Availability", availabilitySchema);
