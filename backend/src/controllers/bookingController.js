import Booking from "../models/Booking.js";
import Slot from "../models/Slot.js";
import Session from "../models/Session.js";
import Review from "../models/Review.js";

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const filter = role === "mentor" ? { mentorId: userId } : { menteeId: userId };

    const bookings = await Booking.find(filter)
      .populate("mentorId", "name email photo")
      .populate("menteeId", "name email photo")
      .sort({ startTime: -1 });

    const bookingIds = bookings.map((b) => b._id);
    const sessions = await Session.find({ bookingId: { $in: bookingIds } });
    const sessionMap = {};
    for (const s of sessions) {
      sessionMap[s.bookingId.toString()] = s;
    }

    const reviewMap = {};
    const reviews = await Review.find({ bookingId: { $in: bookingIds }, menteeId: userId });
    for (const r of reviews) {
      reviewMap[r.bookingId.toString()] = true;
    }

    const enriched = bookings.map((b) => {
      const obj = b.toObject();
      const session = sessionMap[b._id.toString()];
      return {
        ...obj,
        session: session
          ? { _id: session._id, status: session.status, scheduledAt: session.scheduledAt }
          : null,
        reviewed: !!reviewMap[b._id.toString()],
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
