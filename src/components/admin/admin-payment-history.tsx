"use client";

import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import type { AdminPayment } from "@/services/marketplace/admin-queries";

const paymentStatusLabel: Record<AdminPayment["status"], string> = {
  created: "Order created",
  pending: "Awaiting confirmation",
  success: "Captured",
  failed: "Failed",
  refunded: "Refunded",
};

export function AdminPaymentHistory({ payments }: { payments: AdminPayment[] }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = useMemo(
    () => statusFilter === "all" ? payments : payments.filter((payment) => payment.status === statusFilter),
    [payments, statusFilter],
  );

  return (
    <section className="provider-dashboard-panel">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="section-kicker">ACTIVATION PAYMENT LEDGER</p><h2 className="mt-1 text-xl font-black">Recent payment attempts</h2></div>
        <label className="form-field min-w-48">
          <span>Filter by status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="created">Order created</option>
            <option value="pending">Awaiting confirmation</option>
            <option value="success">Captured</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        The ledger includes the latest 250 attempts. Captured is distinct from successfully applied activation.
      </p>
      {filtered.length ? (
        <div className="mt-4 divide-y divide-border">
          {filtered.map((payment) => (
            <article key={payment.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{payment.customer_name}</h3>
                  <span className={`kitchen-status ${
                    payment.status === "success" && payment.activation_applied
                      ? "status-approved"
                      : payment.status === "failed" || payment.status === "refunded"
                        ? "status-rejected"
                        : "status-pending"
                  }`}>
                    {paymentStatusLabel[payment.status]}
                  </span>
                  {payment.status === "success" && !payment.activation_applied ? (
                    <span className="kitchen-status status-rejected">Needs review</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{payment.kitchen_name} · Provider {payment.provider_id.slice(0, 8)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {payment.razorpay_payment_id
                    ? `Gateway payment ending ${payment.razorpay_payment_id.slice(-6)}`
                    : payment.razorpay_order_id
                      ? `Gateway order ending ${payment.razorpay_order_id.slice(-6)}`
                      : "Gateway order not attached"}
                </p>
                {payment.status === "success" && !payment.activation_applied ? (
                  <p className="mt-2 text-xs font-semibold text-destructive">Captured amount is not marked as an applied activation. Review this record before taking further action.</p>
                ) : null}
              </div>
              <div className="sm:text-right">
                <p className="font-black">₹{(payment.amount_paise / 100).toLocaleString("en-IN")}</p>
                <time className="mt-1 block text-xs text-muted-foreground" dateTime={payment.paid_at ?? payment.created_at}>
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(payment.paid_at ?? payment.created_at))}
                </time>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="provider-inline-empty mt-4"><CreditCard size={18} /><p>{payments.length ? "No payments match this status." : "No activation payment attempts yet."}</p></div>
      )}
    </section>
  );
}
