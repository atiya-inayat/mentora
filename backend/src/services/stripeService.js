//  this is where payment logic lives - controller stay clean and complex logic lives in service

import stripe from "../config/stripe.js";

export const createPaymentIntent = async (
  amount, // mentor's hourly rate in dollars
  mentorStripeId, // mentor's Stripe Connect account ID
  bookingId,
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // convert dollars to cents
    currency: "usd",
    payment_method_types: ["card"],

    // This tells Stripe where the money goes
    transfer_data: {
      destination: mentorStripeId,
    },

    // Mentora keeps 10%
    application_fee_amount: Math.round(amount * 100 * 0.1),
    metadata: {
      bookingId: bookingId.toString(),
    },
  });

  // clientSecret goes to frontend so mentee can confirm payment
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};
