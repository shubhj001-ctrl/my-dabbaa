import "server-only";

import Razorpay from "razorpay";
import { z } from "zod";

const razorpayEnvSchema = z.object({
  keyId: z.string().min(1),
  keySecret: z.string().min(1),
});

export function getRazorpayConfig() {
  return razorpayEnvSchema.safeParse({
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export function createRazorpayClient() {
  const config = getRazorpayConfig();
  if (!config.success) return null;

  return {
    keyId: config.data.keyId,
    client: new Razorpay({
      key_id: config.data.keyId,
      key_secret: config.data.keySecret,
    }),
  };
}
