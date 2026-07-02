import Booking from "../models/Booking.js";
import Session from "../models/Session.js";
import { getIO } from "../socket/socketEmitter.js";
import { sendNotification } from "./notificationController.js";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 60 * 60 * 1000;

const computeTimeStatus = (session) => {
  const now = new Date();
  if (session.status === "completed") return "completed";
  if (!session.scheduledAt) return "live";

  const scheduledAt = new Date(session.scheduledAt);
  const expiresAt = session.expiresAt
    ? new Date(session.expiresAt)
    : new Date(scheduledAt.getTime() + SESSION_DURATION_MS);

  if (now > expiresAt) return "expired";
  if (session.status === "live") return "live";
  if (now >= scheduledAt) return "ready";
  if (now >= scheduledAt.getTime() - FIFTEEN_MIN_MS) return "ready";
  return "upcoming";
};

export const startSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const mentorId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ success: false, message: "Booking must be confirmed" });
    }

    if (booking.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const now = new Date();
    const scheduledAt = new Date(booking.startTime);
    const windowOpen = new Date(scheduledAt.getTime() - FIFTEEN_MIN_MS);
    const expiresAt = new Date(scheduledAt.getTime() + SESSION_DURATION_MS);

    if (now < windowOpen) {
      const mins = Math.ceil((scheduledAt - now) / 60000);
      return res.status(400).json({
        success: false,
        message: `Session can only be started within 15 minutes of the scheduled time. ${mins} minutes remaining.`,
      });
    }

    if (now > expiresAt) {
      return res.status(400).json({ success: false, message: "Session time has expired." });
    }

    let session = await Session.findOne({ bookingId: booking._id, status: "live" });
    if (!session) {
      session = await Session.findOneAndUpdate(
        { bookingId: booking._id },
        { status: "live", startTime: now, scheduledAt: booking.startTime, expiresAt },
        { upsert: true, new: true }
      );
    }

    sendNotification({
      userId: booking.menteeId,
      type: "session_started",
      title: "Session Started",
      message: "Your mentoring session has started! Join now.",
      link: `/session/${session._id}`,
    });

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.mentorId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Only the mentor can end the session" });
    }

    const session = await Session.findOne({ bookingId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (session.status !== "live") {
      return res.status(400).json({ success: false, message: "Session must be live" });
    }

    session.status = "completed";
    session.endTime = new Date();
    await session.save();

    booking.status = "completed";
    await booking.save();

    const io = getIO();
    if (io) {
      io.to(session._id.toString()).emit("session_ended", { message: "Session has ended." });
    }

    sendNotification({
      userId: booking.menteeId,
      type: "session_ended",
      title: "Session Ended",
      message: "Your mentoring session has ended. Please leave a review!",
      link: `/review/${booking._id}`,
    });

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    let session = await Session.findById(sessionId).populate({
      path: "bookingId",
      populate: [
        { path: "mentorId", select: "name _id" },
        { path: "menteeId", select: "name _id" },
      ],
    });

    if (!session) {
      session = await Session.findOne({ bookingId: sessionId }).populate({
        path: "bookingId",
        populate: [
          { path: "mentorId", select: "name _id" },
          { path: "menteeId", select: "name _id" },
        ],
      });
    }

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const booking = session.bookingId?._id
      ? session.bookingId
      : await Booking.findById(session.bookingId);
    if (
      booking &&
      booking.mentorId?.toString() !== req.user._id.toString() &&
      booking.menteeId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const timeStatus = computeTimeStatus(session);
    const now = new Date();
    const scheduledAt = new Date(session.scheduledAt || booking?.startTime);
    const timeRemaining = scheduledAt ? scheduledAt.getTime() - now.getTime() : 0;
    const readyToStartIn = scheduledAt
      ? Math.max(0, scheduledAt.getTime() - FIFTEEN_MIN_MS - now.getTime())
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        ...session.toObject(),
        timeStatus,
        timeRemaining,
        readyToStartIn,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
