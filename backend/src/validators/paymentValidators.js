import { z } from "zod";

export const initiatePaymentSchema = z.object({
  params: z.object({
    bookingId: z.string().length(24, "Invalid booking ID"),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  }),
  params: z.object({
    bookingId: z.string().length(24, "Invalid booking ID"),
  }),
});
