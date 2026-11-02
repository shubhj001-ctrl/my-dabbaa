import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";

type RazorpayWebhookPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
};

function isPaymentEntity(value: unknown): value is RazorpayWebhookPayment {
  if (!value || typeof value !== "object") return false;
  const entity = value as Record<string, unknown>;
  return (
    typeof entity.id === "string" &&
    typeof entity.order_id === "string" &&
    typeof entity.amount === "number" &&
    typeof entity.currency === "string" &&
    typeof entity.status === "string" &&
    (entity.captured === undefined || typeof entity.captured === "boolean")
  );
}

function hasValidSignature(rawBody: string, signature: string, secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const supplied = Buffer.from(signature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Razorpay webhook secret is not configured.");
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > 1_000_000) {
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });
  }
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!hasValidSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  if (!event || typeof event !== "object") {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const eventRecord = event as Record<string, unknown>;
  const eventName = eventRecord.event;
  if (eventName !== "payment.captured" && eventName !== "payment.failed") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const payload = eventRecord.payload;
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payment event." }, { status: 400 });
  }
  const paymentSection = (payload as Record<string, unknown>).payment;
  if (!paymentSection || typeof paymentSection !== "object") {
    return NextResponse.json({ error: "Invalid payment event." }, { status: 400 });
  }
  const entity = (paymentSection as Record<string, unknown>).entity;
  if (!isPaymentEntity(entity)) {
    return NextResponse.json({ error: "Invalid payment event." }, { status: 400 });
  }

  if (eventName === "payment.captured" && (entity.status !== "captured" || entity.captured === false)) {
    return NextResponse.json({ error: "Payment is not captured." }, { status: 400 });
  }

  if (!isSupabaseServiceRoleConfigured()) {
    console.error("Razorpay webhook cannot access the payment database.");
    return NextResponse.json({ error: "Payment processing is unavailable." }, { status: 503 });
  }

  const supabase = createAdminClient();
  const { data: result, error } = eventName === "payment.captured"
    ? await supabase.rpc("confirm_activation_payment", {
        p_razorpay_order_id: entity.order_id,
        p_razorpay_payment_id: entity.id,
        p_amount_paise: entity.amount,
        p_currency: entity.currency,
      })
    : await supabase.rpc("fail_activation_payment", {
        p_razorpay_order_id: entity.order_id,
        p_amount_paise: entity.amount,
        p_currency: entity.currency,
      });

  if (error) {
    console.error("Razorpay webhook database processing failed:", error.code);
    return NextResponse.json({ error: "Payment processing failed; the event can be retried." }, { status: 500 });
  }

  if (result !== "activated" && result !== "failed" && result !== "duplicate" && result !== "already_active" && result !== "already_processed") {
    console.error("Razorpay payment event requires review:", result);
  }

  return NextResponse.json({ received: true, result });
}
