import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100, "Name must be 100 characters or fewer."),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^(?:\+91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number.")),
});
