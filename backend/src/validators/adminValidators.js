import { z } from "zod";

export const blockUserSchema = z.object({
  params: z.object({
    userId: z.string().length(24, "Invalid user ID"),
  }),
});

export const approveMentorSchema = z.object({
  params: z.object({
    mentorId: z.string().length(24, "Invalid mentor ID"),
  }),
});
