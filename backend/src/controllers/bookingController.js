import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import MentorProfile from "../models/MentorProfile.js";
import Session from "../models/Session.js";
import Review from "../models/Review.js";
import { sendNotification } from "./notificationController.js";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 60 * 60 * 1000;

const computeBookingTimeStatus = (booking, session) => {
  const now = new Date();
  const scheduledAt = new Date(booking.scheduledAt);
  const expiresAt = new Date(scheduledAt.getTime() + SESSION_DURATION_MS);

  if (session) {
    if (session.status === "completed") return "completed";
    if (session.status === "expired") return "expired";
    if (session.status === "ongoing") {
      if (now >= scheduledAt && now <= expiresAt) return "active";
      return "active";
    }
  }

  if (booking.status === "completed") return "completed";
  if (now > expiresAt) return "expired";
  if (now >= scheduledAt) return "ready_to_start";
  if (now >= scheduledAt.getTime() - FIFTEEN_MIN_MS) return "ready_to_start";
  return "upcoming";
};

export const createBooking = async (req, res) => {
  try {
    const menteeId = req.user._id;
    const { mentorId } = req.params;
    const { scheduledAt } = req.body;

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ success: false, message: "Invalid mentor id." });
    }

    const mentorProfile = await MentorProfile.findById(mentorId);

    if (!mentorProfile) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    if (mentorProfile.userId.toString() === menteeId.toString()) {
      return res.status(400).json({ success: false, message: "you cannot book yourself" });
    }

    const newBooking = await Booking.create({
      menteeId,
      mentorId: mentorProfile.userId,
      status: "pending",
      scheduledAt,
    });

    sendNotification({
      userId: mentorProfile.userId,
      type: "booking_request",
      title: "New Booking Request",
      message: `${req.user.name} wants to book a session with you`,
      link: "/mentor/dashboard",
    });

    return res.status(201).json({ success: true, newBooking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }

    const existingBooking = await Booking.findById(id);

    if (!existingBooking) {
      return res.status(404).json({ success: false, message: "Booking not available" });
    }

    const mentorProfile = await MentorProfile.findOne({ userId: mentorUserId });

    const isAuthorized =
      existingBooking.mentorId.toString() === mentorUserId.toString() ||
      (mentorProfile && existingBooking.mentorId.toString() === mentorProfile._id.toString());

    if (!isAuthorized) {
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

    sendNotification({
      userId: existingBooking.menteeId,
      type: "booking_accepted",
      title: "Booking Accepted",
      message: `${req.user.name} has accepted your booking request`,
      link: `/my-bookings`,
    });

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let filter;
    if (role === "mentor") {
      const mentorProfile = await MentorProfile.findOne({ userId });
      filter = mentorProfile
        ? { $or: [{ mentorId: userId }, { mentorId: mentorProfile._id }] }
        : { mentorId: userId };
    } else {
      filter = { menteeId: userId };
    }

    const bookings = await Booking.find(filter)
      .populate("mentorId", "name email")
      .populate("menteeId", "name email")
      .sort({ createdAt: -1 });

    const bookingIds = bookings.map((b) => b._id);
    const sessions = await Session.find({ bookingId: { $in: bookingIds } });
    const sessionMap = {};
    for (const s of sessions) {
      sessionMap[s.bookingId.toString()] = s;
    }

    const reviewMap = {};
    const reviews = await Review.find({
      bookingId: { $in: bookingIds },
      menteeId: userId,
    });
    for (const r of reviews) {
      reviewMap[r.bookingId.toString()] = true;
    }

    const enriched = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      const session = sessionMap[booking._id.toString()];
      const timeStatus = computeBookingTimeStatus(booking, session);

      return {
        ...bookingObj,
        session: session
          ? {
              _id: session._id,
              status: session.status,
              scheduledAt: session.scheduledAt,
              expiresAt: session.expiresAt,
              startTime: session.startTime,
              endTime: session.endTime,
            }
          : null,
        timeStatus,
        reviewed: !!reviewMap[booking._id.toString()],
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
