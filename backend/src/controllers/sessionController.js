import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Session from "../models/Session.js";
import Payment from "../models/Payment.js";
import MentorProfile from "../models/MentorProfile.js";
import stripe from "../config/stripe.js";

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
    if (booking.status !== "payment_held") {
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
      startTime: new Date(),
      status: "ongoing",
    });

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

export const endSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.sub;

    // 1. Validate
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
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

    // 3. Authorization (mentor OR mentee)
    if (
      booking.mentorId.toString() !== userId &&
      booking.menteeId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 5. Check payment BEFORE completing session
    const payment = await Payment.findOne({ bookingId });

    if (!payment || payment.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    // 4. Find session
    const session = await Session.findOne({ bookingId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Session must be ongoing",
      });
    }

    if (!payment.escrow) {
      return res.status(400).json({
        success: false,
        message: "Payment already released",
      });
    }

    // 6. Update session
    session.status = "completed";
    session.endTime = new Date();
    await session.save();

    // 7. Update booking
    booking.status = "completed";
    await booking.save();

    const mentorProfile = await MentorProfile.findOne({
      userId: booking.mentorId,
    });

    if (!mentorProfile || !mentorProfile.stripeAccountId) {
      return res.status(400).json({
        success: false,
        message: "Mentor Stripe account not found",
      });
    }

    const totalAmount = payment.amount * 100;
    const mentorShare = Math.floor(totalAmount * 0.9);

    // 💸 Transfer to mentor
    await stripe.transfers.create({
      amount: mentorShare,
      currency: "usd",
      destination: mentorProfile.stripeAccountId,
    });

    // mark escrow released
    payment.escrow = false;
    payment.status = "released";
    await payment.save();

    // 9. Response
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
