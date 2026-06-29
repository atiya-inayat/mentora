import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    scheduledAt: z.string().datetime("Invalid date format"),
    message: z.string().optional(),
  }),
  params: z.object({
    mentorId: z.string().length(24, "Invalid mentor ID"),
  }),
});

export const acceptBookingSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid booking ID"),
  }),
});
