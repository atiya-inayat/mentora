import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Session from "../models/Session.js";
import Payment from "../models/Payment.js";
import MentorProfile from "../models/MentorProfile.js";
import stripe from "../config/stripe.js";
import { getIO } from "../socket/socketEmitter.js";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 60 * 60 * 1000;

const computeTimeStatus = (session) => {
  const now = new Date();
  if (session.status === "completed") return "completed";
  if (session.status === "expired") return "expired";
  if (!session.scheduledAt) return "active";

  const scheduledAt = new Date(session.scheduledAt);
  const expiresAt = session.expiresAt ? new Date(session.expiresAt) : new Date(scheduledAt.getTime() + SESSION_DURATION_MS);

  if (now > expiresAt) return "expired";
  if (now >= scheduledAt) return "active";
  if (now >= scheduledAt.getTime() - FIFTEEN_MIN_MS) return "ready_to_start";
  return "upcoming";
};

const autoExpireIfPast = async (session) => {
  const now = new Date();
  if (!session.scheduledAt) return session;
  const expiresAt = session.expiresAt
    ? new Date(session.expiresAt)
    : new Date(session.scheduledAt.getTime() + SESSION_DURATION_MS);

  if (now > expiresAt && session.status !== "completed" && session.status !== "expired") {
    session.status = "expired";
    if (!session.endTime) session.endTime = now;
    await session.save();
  }
  return session;
};

export const startSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const mentorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking Id" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "payment_held") {
      return res.status(400).json({ success: false, message: "Booking must be accepted before starting session" });
    }

    if (booking.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const now = new Date();
    const scheduledAt = new Date(booking.scheduledAt);
    const windowOpen = new Date(scheduledAt.getTime() - FIFTEEN_MIN_MS);

    if (now < windowOpen) {
      const mins = Math.ceil((scheduledAt - now) / 60000);
      return res.status(400).json({
        success: false,
        message: `Session can only be started within 15 minutes of the scheduled time. ${mins} minutes remaining.`,
      });
    }

    const expiresAt = new Date(scheduledAt.getTime() + SESSION_DURATION_MS);
    if (now > expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Session time has expired.",
      });
    }

    let session = await Session.findOne({ bookingId: booking._id, status: "ongoing" });
    if (!session) {
      const existingExpired = await Session.findOne({ bookingId: booking._id, status: "expired" });
      if (existingExpired) {
        return res.status(400).json({
          success: false,
          message: "This session has expired and cannot be started.",
        });
      }

      session = await Session.create({
        bookingId: booking._id,
        startTime: now,
        status: "ongoing",
        scheduledAt: booking.scheduledAt,
        expiresAt,
      });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

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

    if (session.status !== "ongoing") {
      return res.status(400).json({ success: false, message: "Session must be ongoing" });
    }

    const payment = await Payment.findOneAndUpdate(
      { bookingId, escrow: true },
      { $set: { escrow: false } },
      { new: true },
    );
    if (!payment) {
      return res.status(400).json({ success: false, message: "Payment already released or not found" });
    }

    session.status = "completed";
    session.endTime = new Date();
    await session.save();

    const io = getIO();
    if (io) {
      io.to(session._id.toString()).emit("session_ended", {
        message: "Session has ended.",
      });
    }

    booking.status = "completed";
    await booking.save();

    const mentorProfile = await MentorProfile.findOne({ userId: booking.mentorId });
    if (!mentorProfile || !mentorProfile.stripeAccountId) {
      return res.status(400).json({ success: false, message: "Mentor Stripe account not found" });
    }

    const totalAmount = payment.amount * 100;
    const mentorShare = Math.floor(totalAmount * 0.9);

    await stripe.transfers.create({
      amount: mentorShare,
      currency: "usd",
      destination: mentorProfile.stripeAccountId,
    });

    payment.escrow = false;
    payment.status = "released";
    await payment.save();

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const postponeSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newScheduledAt } = req.body;
    const userId = req.user._id;

    if (!newScheduledAt) {
      return res.status(400).json({ success: false, message: "New scheduled date/time is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.mentorId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Only the mentor can postpone this session" });
    }

    const session = await Session.findOne({ bookingId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    booking.scheduledAt = new Date(newScheduledAt);
    await booking.save();

    session.startTime = null;
    session.status = "pending";
    session.scheduledAt = new Date(newScheduledAt);
    session.expiresAt = new Date(new Date(newScheduledAt).getTime() + SESSION_DURATION_MS);
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Session postponed successfully",
      data: { booking, session },
    });
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

    session = await autoExpireIfPast(session);
    const timeStatus = computeTimeStatus(session);

    const now = new Date();
    const scheduledAt = new Date(session.scheduledAt);
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
