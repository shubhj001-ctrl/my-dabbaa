import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createRazorpayClient } from "@/lib/razorpay/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  requestId: z.string().uuid(),
});

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "provider" || !profile.is_active) {
    return NextResponse.json({ error: "An active provider account is required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid accepted request." }, { status: 400 });
  }

  const razorpay = createRazorpayClient();
  if (!razorpay) {
    return NextResponse.json({ error: "Razorpay is not configured on the server." }, { status: 503 });
  }

  const supabase = await createClient();
  const claimToken = randomUUID();
  const { data: reservations, error: reserveError } = await supabase.rpc(
    "reserve_activation_payment",
    { p_request_id: parsed.data.requestId, p_claim_token: claimToken },
  );
  if (reserveError || !reservations?.length) {
    if (reserveError) console.error("Activation payment reservation failed:", reserveError.code);
    const alreadyActive = reserveError?.message.includes("already active") ||
      reserveError?.message.includes("already exists");
    return NextResponse.json(
      { error: alreadyActive ? "This customer is already active for this kitchen." : "This accepted request cannot start an activation payment." },
      { status: alreadyActive ? 409 : 400 },
    );
  }

  const reservation = reservations[0];
  if (reservation.razorpay_order_id) {
    return NextResponse.json({
      paymentId: reservation.payment_id,
      orderId: reservation.razorpay_order_id,
      amount: 19900,
      currency: "INR",
      keyId: razorpay.keyId,
      status: reservation.payment_status,
    });
  }

  if (!reservation.should_create_order) {
    return NextResponse.json(
      { error: "Your activation order is being prepared. Check again in a moment.", pending: true },
      { status: 202 },
    );
  }

  try {
    const order = await razorpay.client.orders.create({
      amount: 19900,
      currency: "INR",
      receipt: reservation.payment_id,
      notes: { activation_payment_id: reservation.payment_id },
    });
    const adminSupabase = createAdminClient();
    const { data: attached, error: attachError } = await adminSupabase.rpc(
      "attach_activation_order",
      {
        p_payment_id: reservation.payment_id,
        p_claim_token: claimToken,
        p_razorpay_order_id: order.id,
      },
    );
    if (attachError || !attached) {
      console.error("Unable to attach Razorpay order to activation:", attachError?.code);
      return NextResponse.json(
        { error: "The order was created but could not be safely linked. Contact support before retrying." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      paymentId: reservation.payment_id,
      orderId: order.id,
      amount: 19900,
      currency: "INR",
      keyId: razorpay.keyId,
      status: "pending",
    });
  } catch (error) {
    console.error(
      "Razorpay order creation failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "We couldn't confirm the order creation. Wait briefly, then check the payment status before retrying." },
      { status: 502 },
    );
  }
}
