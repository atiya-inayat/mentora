import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
    comment: z.string().trim().min(1, "Comment is required"),
  }),
  params: z.object({
    bookingId: z.string().length(24, "Invalid booking ID"),
  }),
});
