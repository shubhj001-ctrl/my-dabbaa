import { z } from "zod";

export const customerRequestSchema = z.object({
  kitchenId: z.string().uuid(),
  preferredMeal: z.enum(["breakfast", "lunch", "dinner", "multiple"]),
  preferredStartDate: z.string().date(),
  message: z.string().trim().max(1000).optional(),
  consentGiven: z.literal(true),
});

export const withdrawRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const providerDecisionSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["accepted", "rejected"]),
});
