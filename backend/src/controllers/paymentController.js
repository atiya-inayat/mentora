import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Slot from "../models/Slot.js";
import Availability from "../models/Availability.js";
import MentorProfile from "../models/MentorProfile.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import stripe from "../config/stripe.js";
import { createCheckoutSession, createTransfer } from "../services/stripeService.js";
import { sendNotification } from "./notificationController.js";

export const initiateCheckout = async (req, res) => {
  try {
    const { slotId, notes } = req.body;
    const menteeId = req.user._id;

    const slot = await Slot.findById(slotId);
    if (!slot || slot.status !== "reserved" || slot.reservedBy.toString() !== menteeId.toString()) {
      return res.status(400).json({ success: false, message: "Slot not reserved by you" });
    }

    const mentorProfile = await MentorProfile.findOne({ userId: slot.mentorId });
    if (!mentorProfile) {
      return res.status(404).json({ success: false, message: "Mentor profile not found" });
    }

    const checkoutSession = await createCheckoutSession(
      mentorProfile.hourlyRate,
      mentorProfile.stripeAccountId,
      slotId,
      slot.mentorId,
      menteeId,
      notes
    );

    await Payment.create({
      amount: mentorProfile.hourlyRate,
      status: "pending",
      stripeCheckoutSessionId: checkoutSession.id,
    });

    return res.status(200).json({ success: true, url: checkoutSession.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createBookingFromSession = async (stripeSession, stripePaymentIntent) => {
  const { slotId, mentorId, menteeId, notes } = stripeSession.metadata;

  const slot = await Slot.findById(slotId);
  if (!slot || slot.status !== "reserved") {
    throw new Error("Slot not reserved");
  }

  const mentorAvail = await Availability.findOne({ mentorId });
  const timezone = mentorAvail?.timezone || "UTC";

  const booking = await Booking.create({
    menteeId,
    mentorId,
    slotId,
    startTime: slot.startTime,
    endTime: slot.endTime,
    timezone,
    notes: notes || "",
    status: "confirmed",
  });

  slot.status = "booked";
  slot.bookingId = booking._id;
  await slot.save();

  await Payment.findOneAndUpdate(
    { stripeCheckoutSessionId: stripeSession.id },
    { bookingId: booking._id, status: "paid", stripePaymentId: stripePaymentIntent }
  );

  const expiresAt = new Date(slot.startTime.getTime() + 60 * 60 * 1000);
  await Session.create({
    bookingId: booking._id,
    status: "scheduled",
    scheduledAt: slot.startTime,
    expiresAt,
  });

  const [menteeUser, mentorUser] = await Promise.all([
    User.findById(menteeId).select("name"),
    User.findById(mentorId).select("name"),
  ]);

  sendNotification({
    userId: menteeId,
    type: "booking_confirmed",
    title: "Booking Confirmed",
    message: `Your payment was successful. Your session with ${mentorUser?.name || "your mentor"} has been confirmed.`,
    link: "/bookings",
  });

  sendNotification({
    userId: mentorId,
    type: "new_booking",
    title: "New Booking",
    message: `You have a new confirmed booking from ${menteeUser?.name || "a mentee"}.`,
    link: "/mentor/dashboard",
  });

  return booking;
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({ message: "Webhook verification failed" });
  }

  if (event.type === "checkout.session.completed") {
    try {
      await createBookingFromSession(event.data.object, event.data.object.payment_intent);
    } catch (dbError) {
      console.error("Webhook processing error:", dbError);
      return res.status(500).json({ received: false, error: "DB update failed" });
    }
  }

  res.status(200).json({ received: true });
};

export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }

    const payment = await Payment.findOne({ stripeCheckoutSessionId: session_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "paid" && payment.bookingId) {
      const booking = await Booking.findById(payment.bookingId)
        .populate("mentorId", "name email photo")
        .populate("menteeId", "name email photo");
      return res.status(200).json({
        success: true, status: "already_confirmed",
        booking: booking ? { _id: booking._id, mentorName: booking.mentorId?.name, startTime: booking.startTime, endTime: booking.endTime, timezone: booking.timezone } : null,
        amount: payment.amount,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed on Stripe" });
    }

    const booking = await createBookingFromSession(session, session.payment_intent);

    return res.status(200).json({
      success: true, status: "confirmed",
      booking: { _id: booking._id, mentorName: booking.mentorId?.name, startTime: booking.startTime, endTime: booking.endTime, timezone: booking.timezone },
      amount: payment.amount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }

    const payment = await Payment.findOne({ stripeCheckoutSessionId: session_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status !== "paid" || !payment.bookingId) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid" && !payment.bookingId) {
        return res.status(202).json({ success: true, status: "processing", message: "Booking is being created" });
      }
      return res.status(200).json({ success: true, status: payment.status, booking: null, amount: payment.amount });
    }

    const booking = await Booking.findById(payment.bookingId)
      .populate("mentorId", "name email photo")
      .populate("menteeId", "name email photo");

    return res.status(200).json({
      success: true,
      status: "paid",
      amount: payment.amount,
      booking: booking
        ? {
            _id: booking._id,
            mentorName: booking.mentorId?.name,
            mentorPhoto: booking.mentorId?.photo,
            menteeName: booking.menteeId?.name,
            startTime: booking.startTime,
            endTime: booking.endTime,
            timezone: booking.timezone,
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const releasePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const payment = await Payment.findOne({ bookingId, status: "paid" });
    if (!payment) {
      return res.status(400).json({ success: false, message: "No paid payment found" });
    }

    const mentorProfile = await MentorProfile.findOne({ userId: booking.mentorId });
    if (!mentorProfile || !mentorProfile.stripeAccountId) {
      return res.status(400).json({ success: false, message: "Mentor Stripe account not found" });
    }

    await createTransfer(payment.amount, mentorProfile.stripeAccountId);

    payment.status = "released";
    await payment.save();

    return res.status(200).json({ success: true, message: "Payment released to mentor" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
