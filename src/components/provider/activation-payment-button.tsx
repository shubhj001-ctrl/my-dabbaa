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
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export function ActivationPaymentButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [message, setMessage] = useState("");

  async function checkStatus(paymentId: string) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 2500));
      try {
        const response = await fetch(`/api/provider/activation-orders/${paymentId}`, {
          cache: "no-store",
        });
        if (!response.ok) continue;

        const status = (await response.json()) as { status: string };
        if (status.status === "success") {
          setMessage("Payment verified. This customer is now activated.");
          router.refresh();
          return;
        }
        if (status.status === "failed") {
          setMessage("Payment failed. You can safely retry the activation fee.");
          router.refresh();
          return;
        }
      } catch {
        continue;
      }
    }

    setMessage("Payment confirmation is still pending. We’ll update this request after Razorpay’s verified webhook arrives.");
    router.refresh();
  }

  async function startPayment() {
    if (busy) return;
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/provider/activation-orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const body = (await response.json()) as OrderResponse & { error?: string; pending?: boolean };
      if (!response.ok) {
        setMessage(body.error ?? "We couldn’t prepare the activation payment.");
        setBusy(false);
        return;
      }
      if (!body.orderId) {
        setMessage(body.error ?? "The order is being prepared. Check again in a moment.");
        setBusy(false);
        return;
      }
      if (!window.Razorpay) {
        setMessage("Secure checkout is still loading. Please try again.");
        setBusy(false);
        return;
      }

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
          void checkStatus(body.paymentId);
        },
        modal: {
          ondismiss: () => {
            setCheckoutOpen(false);
            setBusy(false);
            setMessage("Checkout closed. Activation stays pending until the payment is confirmed.");
            void checkStatus(body.paymentId);
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
        disabled={busy || checkoutOpen || !sdkReady}
        onClick={() => void startPayment()}
        className="button-pop button-lime min-h-10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <LoaderCircle size={15} className="animate-spin" /> : <CreditCard size={15} />}
        {busy ? "Preparing secure checkout…" : checkoutOpen ? "Complete or close checkout" : "Pay ₹199 · activate customer"}
      </button>
      {message ? <p className="mt-2 text-xs leading-5 text-muted-foreground" role="status">{message}</p> : null}
    </div>
  );
}
