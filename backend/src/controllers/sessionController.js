import mongoose from "mongoose";
import Booking from "../models/Booking";
import Session from "../models/Session";

export const startSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const mentorId = req.user.sub;

    // 1. Validate bookingId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking Id",
      });
    }

    // 2. Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 3. Check status
    if (booking.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Booking must be accepted before starting session",
      });
    }

    // 4. Authorization (mentee OR mentor — choose your rule)
    if (booking.mentorId.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 5. Create session
    const session = await Session.create({
      bookingId: booking._id,
      menteeId: booking.menteeId,
      mentorId: booking.mentorId,
      startTime: new Date(),
      status: "ongoing",
    });

    // 6. Update booking status
    booking.status = "ongoing";
    await booking.save();

    // 7. Return response
    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
