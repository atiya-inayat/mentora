import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    comment: {
      type: String,
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Review", reviewSchema);
