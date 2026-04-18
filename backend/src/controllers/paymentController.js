import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import MentorProfile from "../models/MentorProfile.js";
import { createPaymentIntent } from "../services/stripeService.js";
import stripe from "../config/stripe.js";

export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const menteeId = req.user.sub;

    // Step 1: Validate ID format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Step 2: Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Step 3: Verify this mentee owns this booking
    // Why? So mentee A can't pay for mentee B's booking
    if (booking.menteeId.toString() !== menteeId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Step 4: Check booking is accepted
    // Why? Can't pay for a pending or rejected booking
    if (booking.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Booking must be accepted before payment",
      });
    }

    // Step 5: Get mentor's hourly rate and Stripe account
    const mentorProfile = await MentorProfile.findOne({
      userId: booking.mentorId,
    });

    // Step 6: Create Stripe PaymentIntent
    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      mentorProfile.hourlyRate,
      mentorProfile.stripeAccountId, // mentor's Connect account
      bookingId,
    );

    // Step 7: Save payment record to MongoDB
    await Payment.create({
      bookingId: booking._id,
      amount: mentorProfile.hourlyRate,
      status: "pending",
      escrow: true,
      stripePaymentId: paymentIntentId,
    });

    // Step 8: Return clientSecret to frontend
    return res.status(200).json({
      success: true,
      clientSecret,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Stripe signs every webhook — verify it's really from Stripe
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig, // signature header
      process.env.STRIPE_WEBHOOK_SECRET, // your webhook secret
    );
  } catch (error) {
    // Invalid signature — reject it
    return res.status(400).json({ message: "Webhook verification failed" });
  }

  // Handle different event types
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // Update payment status in MongoDB
    await Payment.findOneAndUpdate(
      { stripePaymentId: paymentIntent.id },
      { status: "paid", escrow: true },
    );

    // Update booking status to payment_held
    const bookingIdFromMetaData = paymentIntent.metadata.bookingId;

    await Booking.findByIdAndUpdate(bookingIdFromMetaData, {
      status: "payment_held",
    });
  }

  // Always return 200 to Stripe — tells Stripe you received the event
  res.status(200).json({ received: true });
};
