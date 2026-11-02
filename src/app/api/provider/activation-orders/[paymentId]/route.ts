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
    const captured = payments.items.some((payment) => payment.status === "captured");
    const recordsMatchOrder = payments.items.every((payment) =>
      payment.order_id === data.razorpay_order_id &&
      payment.amount === 19900 &&
      payment.currency === "INR",
    );
    const allFailed = recordsMatchOrder &&
      payments.items.length > 0 &&
      payments.items.every((payment) => payment.status === "failed");

    if (captured) {
      if (!recordsMatchOrder) {
        console.error("Razorpay status check found a captured payment with mismatched order details.");
      }
      return NextResponse.json({
        ...data,
        gatewayStatus: recordsMatchOrder
          ? "captured_waiting_for_verified_webhook"
          : "captured_details_require_review",
      });
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
