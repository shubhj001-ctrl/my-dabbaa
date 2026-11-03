"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, LoaderCircle } from "lucide-react";

type CheckoutOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  theme: { color: string };
  handler: () => void;
  modal: { ondismiss: () => void };
};

type CheckoutInstance = { open: () => void };

declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => CheckoutInstance;
  }
}

type OrderResponse = {
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  status?: string;
};

export function ActivationPaymentButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentBlocked, setPaymentBlocked] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [message, setMessage] = useState("");

  async function checkStatus(paymentId: string, waitBeforeFirstCheck = true) {
    setCheckingStatus(true);
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (waitBeforeFirstCheck || attempt > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
      }
      try {
        const response = await fetch(`/api/provider/activation-orders/${paymentId}`, {
          cache: "no-store",
        });
        if (!response.ok) continue;

        const status = (await response.json()) as { status: string; gatewayStatus?: string };
        if (status.status === "success") {
          setPaymentBlocked(true);
          setMessage("Payment verified. This customer is now activated.");
          router.refresh();
          setCheckingStatus(false);
          return;
        }
        if (status.status === "failed") {
          setPaymentBlocked(false);
          setPaymentId(null);
          setMessage("Payment failed. You can safely retry the activation fee.");
          router.refresh();
          setCheckingStatus(false);
          return;
        }
        if (status.gatewayStatus?.startsWith("captured")) {
          setPaymentBlocked(true);
          setMessage(
            status.gatewayStatus === "captured_details_require_review"
              ? "Payment was received, but its details need review. Don't pay again; contact support."
              : "Payment received. Activation is awaiting Razorpay's verified confirmation; don't pay again.",
          );
          router.refresh();
          setCheckingStatus(false);
          return;
        }
      } catch {
        continue;
      }
    }

    setMessage("Payment status is still being confirmed. Check its status before trying again.");
    router.refresh();
    setCheckingStatus(false);
  }

  async function startPayment() {
    if (busy || paymentBlocked) return;
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/provider/activation-orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const body = (await response.json()) as OrderResponse & { error?: string; pending?: boolean };
      if (body.paymentId) setPaymentId(body.paymentId);
      if (!response.ok) {
        setMessage(body.error ?? "We couldn’t prepare the activation payment.");
        setBusy(false);
        if (body.paymentId) {
          setPaymentBlocked(true);
          if (body.status === "captured_waiting_for_webhook" || body.status === "payment_processing") {
            void checkStatus(body.paymentId);
          }
        }
        return;
      }
      if (!body.orderId) {
        setMessage(body.error ?? "The order is being prepared. Check again in a moment.");
        setBusy(false);
        return;
      }
      if (!body.paymentId || !body.keyId || !body.amount || !body.currency || !window.Razorpay) {
        setMessage("Secure checkout is still loading. Please try again.");
        setBusy(false);
        return;
      }

      const verifiedPaymentId = body.paymentId;
      const checkout = new window.Razorpay({
        key: body.keyId,
        order_id: body.orderId,
        amount: body.amount,
        currency: body.currency,
        name: "My Dabbaa",
        description: "One-time customer activation",
        theme: { color: "#315b43" },
        handler: () => {
          setCheckoutOpen(false);
          setBusy(false);
          void checkStatus(verifiedPaymentId);
        },
        modal: {
          ondismiss: () => {
            setCheckoutOpen(false);
            setBusy(false);
            setMessage("Checkout closed. Activation stays pending until the payment is confirmed.");
            void checkStatus(verifiedPaymentId);
          },
        },
      });
      setCheckoutOpen(true);
      checkout.open();
    } catch {
      setCheckoutOpen(false);
      setMessage("We couldn’t reach the payment service. Check the payment status before trying again.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
      />
      <button
        type="button"
        disabled={busy || checkoutOpen || !sdkReady || paymentBlocked}
        onClick={() => void startPayment()}
        className="button-pop button-lime min-h-10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <LoaderCircle size={15} className="animate-spin" /> : <CreditCard size={15} />}
        {busy ? "Preparing secure checkout…" : checkoutOpen ? "Complete or close checkout" : paymentBlocked ? "Payment verification pending" : "Pay ₹199 · activate customer"}
      </button>
      {paymentId && paymentBlocked ? (
        <button
          type="button"
          disabled={checkingStatus}
          onClick={() => void checkStatus(paymentId, false)}
          className="mt-2 text-xs font-medium text-foreground underline underline-offset-4 disabled:opacity-60"
        >
          {checkingStatus ? "Checking payment status…" : "Check payment status"}
        </button>
      ) : null}
      {message ? <p className="mt-2 text-xs leading-5 text-muted-foreground" role="status">{message}</p> : null}
    </div>
  );
}
