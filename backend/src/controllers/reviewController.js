import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import MentorProfile from "../models/MentorProfile.js";

export const creatReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const menteeId = req.user.sub;

    const { comment, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mentee id." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Ibooking must be completed before giving review.",
      });
    }
    const mentorId = booking.mentorId;

    const existingReview = await Review.findOne({ bookingId, menteeId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "you have alrwady reviewed this mentor.",
      });
    }

    const review = await Review.create({
      menteeId,
      mentorId,
      bookingId,
      comment,
      rating,
    });

    // calculate new average
    const result = await Review.aggregate([
      { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },

      {
        $group: {
          _id: "$mentorId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const average = result[0]?.averageRating || 0;
    const totalReviews = result[0]?.totalReviews || 0;

    await MentorProfile.findOneAndUpdate(
      { userId: mentorId },
      {
        averageRating: average,
        totalReviews: result[0]?.totalReviews || 0,
      },
    );

    return res.status(201).json({ success: true, review });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};
