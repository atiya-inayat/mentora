import { z } from "zod";

export const startSessionSchema = z.object({
  params: z.object({
    bookingId: z.string().length(24, "Invalid booking ID"),
  }),
});

export const endSessionSchema = z.object({
  params: z.object({
    bookingId: z.string().length(24, "Invalid booking ID"),
  }),
});

export const getSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().length(24, "Invalid session ID"),
  }),
});
