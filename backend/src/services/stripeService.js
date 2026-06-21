//  this is where payment logic lives - controller stay clean and complex logic lives in service

import stripe from "../config/stripe.js";

export const createPaymentIntent = async (
  amount,
  mentorStripeId,
  bookingId,
) => {
  const intentParams = {
    amount: amount * 100,
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      bookingId: bookingId.toString(),
    },
  };

  // If mentor has a Stripe Connect account, send funds directly to them
  // Mentora keeps 10% as platform fee
  if (mentorStripeId) {
    intentParams.transfer_data = {
      destination: mentorStripeId,
    };
    intentParams.application_fee_amount = Math.round(amount * 100 * 0.1);
  }

  const paymentIntent = await stripe.paymentIntents.create(intentParams);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};
