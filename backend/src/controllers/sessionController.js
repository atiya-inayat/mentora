import Booking from "../models/Booking.js";
import Session from "../models/Session.js";
import Payment from "../models/Payment.js";
import MentorProfile from "../models/MentorProfile.js";
import { getIO } from "../socket/socketEmitter.js";
import { sendNotification } from "./notificationController.js";
import { createTransfer } from "../services/stripeService.js";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 60 * 60 * 1000;

const computeTimeStatus = (session, scheduledAt) => {
  const now = new Date();
  if (session.status === "completed") return "completed";
  if (!scheduledAt) return "available";

  const start = new Date(scheduledAt);
  const expiresAt = session.expiresAt
    ? new Date(session.expiresAt)
    : new Date(start.getTime() + SESSION_DURATION_MS);

  if (now > expiresAt && session.status !== "completed") return "expired";
  if (session.status === "live") return "live";
  if (session.status !== "completed" && now >= start.getTime() - FIFTEEN_MIN_MS) return "joinable";
  return "upcoming";
};

export const joinSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found. Please try again." });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ success: false, message: "Booking must be confirmed to join." });
    }

    const isMentor = booking.mentorId.toString() === userId.toString();
    const isMentee = booking.menteeId.toString() === userId.toString();
    if (!isMentor && !isMentee) {
      return res.status(403).json({ success: false, message: "You are not a participant in this session." });
    }

    const now = new Date();
    const scheduledAt = new Date(booking.startTime);
    const windowOpen = new Date(scheduledAt.getTime() - FIFTEEN_MIN_MS);
    const expiresAt = new Date(scheduledAt.getTime() + SESSION_DURATION_MS);

    if (now < windowOpen) {
      const totalMins = Math.ceil((scheduledAt.getTime() - now.getTime()) / 60000);
      return res.status(400).json({
        success: false,
        message: `You can join this session 15 minutes before the scheduled start time. ${totalMins} minutes remaining.`,
        timeRemaining: scheduledAt.getTime() - now.getTime(),
      });
    }

    if (now > expiresAt) {
      return res.status(400).json({ success: false, message: "This session has already ended." });
    }

    let session = await Session.findOne({ bookingId: booking._id });

    if (isMentor) {
      if (!session) {
        session = await Session.create({
          bookingId: booking._id,
          status: "host_joined",
          scheduledAt: booking.startTime,
          expiresAt,
          participants: { mentor: true, mentee: false },
        });
      } else {
        session.participants.mentor = true;
        if (session.status === "guest_waiting") {
          session.status = "guest_waiting";
        } else if (session.status === "scheduled") {
          session.status = "host_joined";
        }
        await session.save();
      }
    }

    if (isMentee) {
      if (!session) {
        session = await Session.create({
          bookingId: booking._id,
          status: "guest_waiting",
          scheduledAt: booking.startTime,
          expiresAt,
          participants: { mentor: false, mentee: true },
        });
      } else {
        session.participants.mentee = true;
        if (session.status === "host_joined") {
          session.status = "guest_waiting";
        } else if (session.status !== "live" && session.status !== "completed") {
          session.status = "guest_waiting";
        }
        await session.save();
      }

      const io = getIO();
      if (io) {
        io.to(`user:${booking.mentorId}`).emit("admission_request", {
          sessionId: session._id.toString(),
          menteeName: req.user.name || "A mentee",
          menteeId: userId.toString(),
        });
      }

      sendNotification({
        userId: booking.mentorId,
        type: "admission_request",
        title: "Join Request",
        message: `${req.user.name || "A mentee"} wants to join the session.`,
        link: `/session/${session._id}`,
      });
    }

    const populatedSession = await Session.findById(session._id).populate({
      path: "bookingId",
      populate: [
        { path: "mentorId", select: "name _id photo" },
        { path: "menteeId", select: "name _id photo" },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        ...populatedSession.toObject(),
        timeStatus: computeTimeStatus(populatedSession, populatedSession.scheduledAt),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const admitGuest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    const booking = await Booking.findById(session.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.mentorId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Only the host can admit participants." });
    }

    if (session.status !== "guest_waiting" && session.status !== "host_joined") {
      return res.status(400).json({ success: false, message: "No participant is waiting to be admitted." });
    }

    session.status = "live";
    session.startTime = session.startTime || new Date();
    session.admittedAt = new Date();
    session.participants.mentee = true;
    await session.save();

    await booking.save();

    const io = getIO();
    if (io) {
      io.to(session._id.toString()).emit("guest_admitted", {
        message: "You have been admitted to the session.",
        sessionId: session._id.toString(),
      });
    }

    sendNotification({
      userId: booking.menteeId,
      type: "session_started",
      title: "Session Started",
      message: "The mentor has admitted you. The session is now live!",
      link: `/session/${session._id}`,
    });

    const populatedSession = await Session.findById(session._id).populate({
      path: "bookingId",
      populate: [
        { path: "mentorId", select: "name _id photo" },
        { path: "menteeId", select: "name _id photo" },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        ...populatedSession.toObject(),
        timeStatus: "live",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const declineGuest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    const booking = await Booking.findById(session.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.mentorId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Only the host can decline participants." });
    }

    session.status = "host_joined";
    session.participants.mentee = false;
    await session.save();

    const io = getIO();
    if (io) {
      io.to(`user:${booking.menteeId}`).emit("admission_declined", {
        sessionId: session._id.toString(),
        message: "The host has declined your request to join.",
      });
    }

    return res.status(200).json({ success: true, message: "Participant request declined." });
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
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.mentorId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Only the mentor can end the session." });
    }

    const session = await Session.findOne({ bookingId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    if (session.status !== "live" && session.status !== "guest_waiting" && session.status !== "host_joined") {
      return res.status(400).json({ success: false, message: "Session cannot be ended in its current state." });
    }

    session.status = "completed";
    session.endTime = new Date();
    await session.save();

    booking.status = "completed";
    await booking.save();

    const payment = await Payment.findOne({ bookingId: booking._id, status: "paid" });
    if (payment) {
      const mentorProfile = await MentorProfile.findOne({ userId: booking.mentorId });
      if (mentorProfile?.stripeAccountId) {
        try {
          await createTransfer(payment.amount, mentorProfile.stripeAccountId);
          payment.status = "released";
          await payment.save();
        } catch (transferError) {
          console.error("Payment transfer failed:", transferError);
        }
      }
    }

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

const resolveSession = async (id) => {
  let session = await Session.findById(id);
  if (!session) {
    session = await Session.findOne({ bookingId: id });
  }
  return session;
};

export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    let session = await resolveSession(sessionId);
    if (session) {
      session = await session.populate({
        path: "bookingId",
        populate: [
          { path: "mentorId", select: "name _id photo" },
          { path: "menteeId", select: "name _id photo" },
        ],
      });
    }

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    const booking = session.bookingId?._id
      ? session.bookingId
      : await Booking.findById(session.bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (
      booking.mentorId?._id?.toString() !== req.user._id.toString() &&
      booking.mentorId?.toString() !== req.user._id.toString() &&
      booking.menteeId?._id?.toString() !== req.user._id.toString() &&
      booking.menteeId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const scheduledAt = session.scheduledAt || booking.startTime;
    const timeStatus = computeTimeStatus(session, scheduledAt);
    const now = new Date();
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
