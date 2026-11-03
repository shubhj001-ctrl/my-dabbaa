import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createRazorpayClient } from "@/lib/razorpay/server";
import {
  createAdminClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const paymentIdSchema = z.string().uuid();

export async function GET(
  _request: Request,
  context: { params: Promise<{ paymentId: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "provider" || !profile.is_active) {
    return NextResponse.json({ error: "An active provider account is required." }, { status: 401 });
  }

  const { paymentId } = await context.params;
  if (!paymentIdSchema.safeParse(paymentId).success) {
    return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activation_payments")
    .select("id,status,razorpay_order_id,paid_at")
    .eq("id", paymentId)
    .eq("provider_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("Unable to check activation payment status:", error.code);
    return NextResponse.json({ error: "Payment status is temporarily unavailable." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  if (data.status !== "pending" || !data.razorpay_order_id) {
    return NextResponse.json(data);
  }

  const razorpay = createRazorpayClient();
  if (!razorpay || !isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Gateway status checking is not configured. The payment remains pending." },
      { status: 503 },
    );
  }

  try {
    const payments = await razorpay.client.orders.fetchPayments(data.razorpay_order_id);
    const capturedPayments = payments.items.filter((payment) => payment.status === "captured");
    const recordsMatchOrder = payments.items.every((payment) =>
      payment.order_id === data.razorpay_order_id &&
      Number(payment.amount) === 19900 &&
      payment.currency === "INR",
    );
    const allFailed = recordsMatchOrder &&
      payments.items.length > 0 &&
      payments.items.every((payment) => payment.status === "failed");

    if (capturedPayments.length > 0) {
      if (!recordsMatchOrder || capturedPayments.length !== 1) {
        console.error("Razorpay status check found captured payment details requiring review.");
        return NextResponse.json({
          ...data,
          gatewayStatus: "captured_details_require_review",
        });
      }

      const { data: result, error: confirmError } = await createAdminClient().rpc(
        "confirm_activation_payment",
        {
          p_razorpay_order_id: data.razorpay_order_id,
          p_razorpay_payment_id: capturedPayments[0].id,
          p_amount_paise: Number(capturedPayments[0].amount),
          p_currency: capturedPayments[0].currency,
        },
      );
      if (confirmError) {
        console.error("Unable to reconcile captured Razorpay payment:", confirmError.code);
        return NextResponse.json(
          { error: "Razorpay captured the payment, but activation could not be recorded. Don't pay again; contact support." },
          { status: 500 },
        );
      }

      if (result === "activated" || result === "duplicate" || result === "already_active") {
        return NextResponse.json({ ...data, status: "success", gatewayStatus: result });
      }

      console.error("Captured Razorpay payment could not activate the request:", result);
      return NextResponse.json(
        {
          error: "Razorpay captured the payment, but the request needs support review. Don't pay again.",
          ...data,
          gatewayStatus: result,
        },
        { status: 409 },
      );
    }

    if (allFailed) {
      const { error: failureError } = await createAdminClient().rpc(
        "fail_activation_payment",
        {
          p_razorpay_order_id: data.razorpay_order_id,
          p_amount_paise: 19900,
          p_currency: "INR",
        },
      );
      if (failureError) {
        console.error("Unable to record Razorpay's failed payment status:", failureError.code);
        return NextResponse.json({ error: "Payment status could not be updated." }, { status: 500 });
      }

      return NextResponse.json({ ...data, status: "failed" });
    }

    return NextResponse.json({ ...data, gatewayStatus: "pending" });
  } catch (error) {
    console.error(
      "Razorpay payment status check failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Razorpay status is temporarily unavailable. The payment remains pending." },
      { status: 502 },
    );
  }
}
