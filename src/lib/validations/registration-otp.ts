import { z } from "zod";

const emailSchema = z.string().trim().email().max(254);

export const registrationOtpSchema = z.object({
  email: emailSchema,
  token: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export const registrationResendSchema = z.object({
  email: emailSchema,
});
