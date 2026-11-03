import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createRazorpayClient } from "@/lib/razorpay/server";
import {
  createAdminClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/supabase/admin";
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
  let claimToken = randomUUID();
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

  let reservation = reservations[0];
  if (reservation.razorpay_order_id) {
    try {
      const [order, payments] = await Promise.all([
        razorpay.client.orders.fetch(reservation.razorpay_order_id),
        razorpay.client.orders.fetchPayments(reservation.razorpay_order_id),
      ]);
      const paymentRecordsMatchOrder = payments.items.every((payment) =>
        payment.order_id === reservation.razorpay_order_id &&
        payment.amount === 19900 &&
        payment.currency === "INR",
      );

      if (!paymentRecordsMatchOrder) {
        console.error("Razorpay order contains payment details that require review.");
        return NextResponse.json(
          {
            error: "We couldn't verify the existing payment attempt. Don't try another payment; contact support.",
            paymentId: reservation.payment_id,
            status: "verification_required",
          },
          { status: 409 },
        );
      }

      if (order.status === "paid" || payments.items.some((payment) => payment.status === "captured")) {
        return NextResponse.json({
          message: "Payment was received and is awaiting verified activation. Don't pay again; refresh the request shortly.",
          paymentId: reservation.payment_id,
          status: "captured_waiting_for_webhook",
        });
      }

      const allAttemptsFailed = payments.items.length > 0 &&
        payments.items.every((payment) => payment.status === "failed");
      if (allAttemptsFailed) {
        if (!isSupabaseServiceRoleConfigured()) {
          return NextResponse.json(
            { error: "A retry is not available until payment status is recorded." },
            { status: 503 },
          );
        }

        const adminSupabase = createAdminClient();
        const { data: failureResult, error: failureError } = await adminSupabase.rpc(
          "fail_activation_payment",
          {
            p_razorpay_order_id: reservation.razorpay_order_id,
            p_amount_paise: 19900,
            p_currency: "INR",
          },
        );
        if (failureError || failureResult !== "failed") {
          console.error(
            "Unable to record failed Razorpay attempts:",
            failureError?.code ?? failureResult,
          );
          return NextResponse.json(
            { error: "We couldn't safely prepare a retry. Please check the payment status again." },
            { status: 503 },
          );
        }

        claimToken = randomUUID();
        const retryReservation = await supabase.rpc("reserve_activation_payment", {
          p_request_id: parsed.data.requestId,
          p_claim_token: claimToken,
        });
        if (retryReservation.error || !retryReservation.data?.length) {
          console.error("Unable to reserve a new activation attempt:", retryReservation.error?.code);
          return NextResponse.json(
            { error: "We couldn't prepare a fresh payment attempt. Please try again." },
            { status: 503 },
          );
        }
        reservation = retryReservation.data[0];
      } else if (order.status !== "created" || payments.items.length > 0) {
        return NextResponse.json({
          message: "The current payment attempt is still being processed. Check its status before trying again.",
          paymentId: reservation.payment_id,
          status: "payment_processing",
        });
      } else {
        return NextResponse.json({
          paymentId: reservation.payment_id,
          orderId: reservation.razorpay_order_id,
          amount: 19900,
          currency: "INR",
          keyId: razorpay.keyId,
          status: reservation.payment_status,
        });
      }
    } catch (error) {
      console.error(
        "Unable to verify an existing Razorpay order:",
        error instanceof Error ? error.name : "UnknownError",
      );
      return NextResponse.json(
        { error: "We couldn't verify the previous payment attempt. Check its status before trying again." },
        { status: 502 },
      );
    }
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
