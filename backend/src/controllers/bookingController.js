import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import MentorProfile from "../models/MentorProfile.js";

export const createBooking = async (req, res) => {
  try {
    const menteeId = req.user.sub;
    const { mentorId } = req.params;
    const { scheduledAt } = req.body;

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mentor id." });
    }

    const mentorProfile = await MentorProfile.findById(mentorId);

    if (!mentorProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
    }

    // prevent self booking
    if (mentorProfile.userId.toString() === menteeId) {
      return res
        .status(400)
        .json({ success: false, message: "you cannot book yourself" });
    }

    const newBooking = await Booking.create({
      menteeId,
      mentorId,
      status: "pending",
      scheduledAt,
    });

    return res.status(201).json({ success: true, newBooking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorUserId = req.user.sub;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }

    const existingBooking = await Booking.findById(id);

    if (!existingBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not available" });
    }

    // Authorization check
    if (existingBooking.mentorId.toString() !== mentorUserId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to accept this booking",
      });
    }

    if (existingBooking.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Booking already accepted",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: { status: "accepted" } },
      { new: true },
    );

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
