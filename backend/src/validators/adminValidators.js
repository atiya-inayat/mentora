import { z } from "zod";

const objectId = z.string().length(24, "Invalid ID");

export const blockUserSchema = z.object({
  params: z.object({ userId: objectId }),
});

export const unblockUserSchema = z.object({
  params: z.object({ userId: objectId }),
});

export const approveMentorSchema = z.object({
  params: z.object({ mentorId: objectId }),
});
