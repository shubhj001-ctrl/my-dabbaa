import { getProviderActivationPayments } from "@/services/marketplace/activation-queries";

export default async function ProviderPaymentsPage() {
  const result = await getProviderActivationPayments();
  if (result.status === "error") {
    return (
      <div className="provider-page space-y-6">
        <header className="provider-page-heading"><p className="section-kicker">ACTIVATION PAYMENTS</p><h1>A clear record of customer activations.</h1><p>This is the one-time ₹199 My Dabbaa activation fee, not food subscription revenue.</p></header>
        <section className="provider-empty-card"><h2>Payment history isn’t available.</h2><p>Apply the Stage 4 activation migration and try again.</p></section>
      </div>
    );
  }

  const successful = result.payments.filter((payment) => payment.status === "success" && payment.activation_applied);
  const totalPaise = successful.reduce((total, payment) => total + payment.amount_paise, 0);

  return (
    <div className="provider-page space-y-7">
      <header className="provider-page-heading">
        <p className="section-kicker">ACTIVATION PAYMENTS</p>
        <h1>A clear record of customer activations.</h1>
        <p>This is the one-time ₹199 My Dabbaa activation fee, not food subscription revenue.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2">
        <article className="provider-metric-card"><p>Verified activation fees</p><strong>{successful.length}</strong><small>Successful, applied activations</small></article>
        <article className="provider-metric-card"><p>Total successful fees</p><strong>₹{(totalPaise / 100).toLocaleString("en-IN")}</strong><small>Platform activation fees only</small></article>
      </section>
      <section className="provider-dashboard-panel">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="section-kicker">PAYMENT HISTORY</p><h2 className="text-xl font-black">Activation fee records</h2></div></div>
        {!result.payments.length ? (
          <div className="provider-inline-empty"><p>No activation payments yet. Accepted requests appear on the Requests page.</p></div>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {result.payments.map((payment) => (
              <article key={payment.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <h3 className="font-bold">{payment.customer_name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{payment.kitchen_name} · ₹199 · {payment.status.replace("_", " ")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {payment.razorpay_payment_id
                      ? `Razorpay payment: ${payment.razorpay_payment_id}`
                      : payment.razorpay_order_id
                        ? `Razorpay order: ${payment.razorpay_order_id}`
                        : "Order is being prepared"}
                    {payment.status === "success" && !payment.activation_applied ? " · activation already exists; review this duplicate capture" : ""}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(payment.paid_at ?? payment.created_at))}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
