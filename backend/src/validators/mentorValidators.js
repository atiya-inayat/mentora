import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createMentorProfileSchema = z.object({
  body: z.object({
    bio: z.string().trim().min(10, "Bio must be at least 10 characters"),
    hourlyRate: z.number().positive("Hourly rate must be positive"),
    skills: z.array(z.string().trim().min(1)).min(1, "At least one skill required"),
    availability: z
      .array(
        z.object({
          day: z.enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ]),
          startTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
          endTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
        }),
      )
      .optional(),
  }),
});
