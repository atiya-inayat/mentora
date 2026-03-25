import mongoose from "mongoose";

const mentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    skills: [String],
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("MentorProfile", mentorProfileSchema);
