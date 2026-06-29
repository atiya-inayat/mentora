//  this is where payment logic lives - controller stay clean and complex logic lives in service

import stripe from "../config/stripe.js";

export const createPaymentIntent = async (amount, mentorStripeId, bookingId) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      bookingId: bookingId.toString(),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};
