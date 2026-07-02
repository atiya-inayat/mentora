import stripe from "../config/stripe.js";

const DOMAIN = process.env.FRONTEND_URL || "http://localhost:3000";

export const createCheckoutSession = async (amount, mentorStripeId, slotId, mentorId, menteeId, notes) => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Mentoring Session" },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      slotId: slotId.toString(),
      mentorId: mentorId.toString(),
      menteeId: menteeId.toString(),
      notes: notes || "",
    },
    success_url: `${DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}/mentors/${mentorId}?cancelled=true`,
  });

  return session;
};

export const createTransfer = async (amount, destinationStripeAccountId) => {
  const totalCents = amount * 100;
  const mentorShare = Math.floor(totalCents * 0.9);
  return stripe.transfers.create({
    amount: mentorShare,
    currency: "usd",
    destination: destinationStripeAccountId,
  });
};
